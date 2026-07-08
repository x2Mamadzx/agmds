import { Router, type IRouter } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, visitsTable } from "@workspace/db";
import { CreateVisitBody, UpdateVisitBody, UpdateVisitParams } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

router.post("/visits", async (req, res): Promise<void> => {
  const parsed = CreateVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [visit] = await db
    .insert(visitsTable)
    .values({ sessionId: parsed.data.sessionId })
    .onConflictDoNothing({ target: visitsTable.sessionId })
    .returning();

  if (visit) {
    res.status(201).json(visit);
    return;
  }

  // Session already tracked (e.g. duplicate call) — return the existing row.
  const [existing] = await db
    .select()
    .from(visitsTable)
    .where(eq(visitsTable.sessionId, parsed.data.sessionId));
  res.status(201).json(existing);
});

router.patch("/visits/:sessionId", async (req, res): Promise<void> => {
  const params = UpdateVisitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Heartbeats can arrive out of order (backgrounded tabs, retried requests),
  // so duration only ever increases, and a session marked converted stays
  // converted even if a stale/racing update omits the flag.
  const updates: Record<string, unknown> = { lastSeenAt: new Date() };
  if (parsed.data.durationSeconds !== undefined) {
    updates.durationSeconds = sql`greatest(${visitsTable.durationSeconds}, ${parsed.data.durationSeconds})`;
  }
  if (parsed.data.converted !== undefined) {
    updates.converted = sql`${visitsTable.converted} or ${parsed.data.converted}`;
  }

  const [visit] = await db
    .update(visitsTable)
    .set(updates)
    .where(eq(visitsTable.sessionId, params.data.sessionId))
    .returning();

  if (!visit) {
    res.status(404).json({ error: "Visit not found" });
    return;
  }

  res.json(visit);
});

router.get("/visits/stats", async (req, res): Promise<void> => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  async function windowStats(since: Date) {
    const [row] = await db
      .select({
        count: sql<number>`count(*)::int`,
        avgDurationSeconds: sql<number>`coalesce(avg(${visitsTable.durationSeconds}), 0)::int`,
        converted: sql<number>`count(*) filter (where ${visitsTable.converted})::int`,
      })
      .from(visitsTable)
      .where(and(gte(visitsTable.startedAt, since)));

    const count = row?.count ?? 0;
    const converted = row?.converted ?? 0;
    return {
      count,
      avgDurationSeconds: row?.avgDurationSeconds ?? 0,
      converted,
      conversionRate: count > 0 ? converted / count : 0,
    };
  }

  const [last24h, last7d] = await Promise.all([windowStats(since24h), windowStats(since7d)]);
  res.json({ last24h, last7d });
});

export default router;
