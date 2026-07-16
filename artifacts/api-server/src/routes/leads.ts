import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { desc, eq, sql } from "drizzle-orm";
import { db, leadsTable, leadStatuses } from "@workspace/db";
import {
  CreateLeadBody,
  UpdateLeadBody,
  UpdateLeadParams,
  DeleteLeadParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router: IRouter = Router();

// ─── Rate limiter for public lead submission ─────────────────────────────────
// Max 5 form submissions per IP per 15 minutes — blocks spam bots
const leadSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de soumissions. Veuillez réessayer dans quelques minutes." },
});

// ─── Strip HTML tags from string values — prevent XSS stored in DB ──────────
function sanitizeString(value: string): string {
  return value
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/[<>]/g, "")   // strip stray angle brackets
    .trim();
}

function sanitizeLeadInput(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = typeof value === "string" ? sanitizeString(value) : value;
  }
  return result;
}

// ─── POST /leads — public form submission ────────────────────────────────────
router.post("/leads", leadSubmitLimiter, async (req, res): Promise<void> => {
  const parsed = CreateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Sanitize all string fields before persisting
  const cleanData = sanitizeLeadInput(parsed.data as Record<string, unknown>);
  const finalParsed = CreateLeadBody.safeParse(cleanData);
  if (!finalParsed.success) {
    res.status(400).json({ error: "Données invalides." });
    return;
  }

  const [lead] = await db.insert(leadsTable).values(finalParsed.data).returning();

  req.log.info({ leadId: lead?.id }, "New lead submitted");
  res.status(201).json(lead);
});

// ─── GET /leads — admin only ─────────────────────────────────────────────────
router.get("/leads", async (req, res): Promise<void> => {
  if (!requireAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  res.json(leads);
});

// ─── GET /leads/summary — admin only ─────────────────────────────────────────
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

// ─── PATCH /leads/:id — admin only ───────────────────────────────────────────
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

// ─── DELETE /leads/:id — admin only ──────────────────────────────────────────
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
