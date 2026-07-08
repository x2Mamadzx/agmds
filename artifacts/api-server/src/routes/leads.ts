import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, leadsTable, leadStatuses } from "@workspace/db";
import {
  CreateLeadBody,
  UpdateLeadBody,
  UpdateLeadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAdmin(req: Parameters<Parameters<IRouter["get"]>[1]>[0]): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;
  const provided = req.header("x-admin-password");
  return provided === expected;
}

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db.insert(leadsTable).values(parsed.data).returning();

  req.log.info({ leadId: lead?.id }, "New lead submitted");
  res.status(201).json(lead);
});

router.get("/leads", async (req, res): Promise<void> => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  res.json(leads);
});

router.get("/leads/summary", async (req, res): Promise<void> => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .select({ status: leadsTable.status, count: sql<number>`count(*)::int` })
    .from(leadsTable)
    .groupBy(leadsTable.status);

  const countByStatus = new Map(rows.map((r) => [r.status, r.count]));
  const groups = leadStatuses.map((status) => ({
    status,
    count: countByStatus.get(status) ?? 0,
  }));
  const total = groups.reduce((sum, g) => sum + g.count, 0);

  res.json({ total, groups });
});

router.patch("/leads/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = UpdateLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [lead] = await db
    .update(leadsTable)
    .set({ status: parsed.data.status })
    .where(eq(leadsTable.id, params.data.id))
    .returning();

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.json(lead);
});

export default router;
