import { Router, type IRouter, type Request } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { db, leadsTable, leadStatuses } from "@workspace/db";
import {
  CreateLeadBody,
  UpdateLeadBody,
  UpdateLeadParams,
  DeleteLeadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Basic in-memory brute-force guard for the admin password gate: locks an IP
// out for a short window after too many failed attempts. Adequate for a
// single-instance dev/small-scale deployment; not distributed across replicas.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000;
const failedAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function isRateLimited(ip: string): boolean {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip: string): void {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAttemptAt: Date.now() });
    return;
  }
  entry.count += 1;
}

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

function requireAdmin(req: Request): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;

  const ip = req.ip ?? "unknown";
  if (isRateLimited(ip)) return false;

  const provided = req.header("x-admin-password");
  const ok = !!provided && safeCompare(provided, expected);
  if (!ok) recordFailedAttempt(ip);
  return ok;
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

router.delete("/leads/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteLeadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [lead] = await db
    .delete(leadsTable)
    .where(eq(leadsTable.id, params.data.id))
    .returning();

  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  res.status(204).send();
});

export default router;
