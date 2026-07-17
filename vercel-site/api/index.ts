/**
 * MDS Marketing — Express API
 * Deployed as a Render Web Service (Express serves frontend + API)
 *
 * Tables required (run once against your DATABASE_URL):
 *   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
 *   CREATE TABLE IF NOT EXISTS leads (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     nom TEXT NOT NULL,
 *     entreprise TEXT,
 *     courriel TEXT NOT NULL,
 *     telephone TEXT NOT NULL,
 *     service TEXT NOT NULL,
 *     message TEXT,
 *     status TEXT NOT NULL DEFAULT 'nouveau',
 *     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *   );
 *   CREATE TABLE IF NOT EXISTS visits (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     session_id TEXT NOT NULL UNIQUE,
 *     started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 *     duration_seconds INTEGER NOT NULL DEFAULT 0,
 *     converted BOOLEAN NOT NULL DEFAULT FALSE
 *   );
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import helmet from "helmet";
import { fileURLToPath } from "url";
import path from "path";
import { rateLimit } from "express-rate-limit";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { desc, eq, gte, and, sql } from "drizzle-orm";
import { z } from "zod";

// ─── Database ────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
});

const db = drizzle(pool);

// ─── Auto-migrate (crée les tables si elles n'existent pas) ──────────────────

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE TABLE IF NOT EXISTS leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nom TEXT NOT NULL,
        entreprise TEXT,
        courriel TEXT NOT NULL,
        telephone TEXT NOT NULL,
        service TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'nouveau',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id TEXT NOT NULL UNIQUE,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        converted BOOLEAN NOT NULL DEFAULT FALSE
      );
    `);
    console.log("[MDS] Tables OK");
  } catch (err) {
    console.error("[MDS] Migration failed:", err);
  } finally {
    client.release();
  }
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const leadsTable = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  nom: text("nom").notNull(),
  entreprise: text("entreprise"),
  courriel: text("courriel").notNull(),
  telephone: text("telephone").notNull(),
  service: text("service").notNull(),
  message: text("message"),
  status: text("status").notNull().default("nouveau"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

const visitsTable = pgTable("visits", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  converted: boolean("converted").notNull().default(false),
});

// ─── Zod schemas ─────────────────────────────────────────────────────────────

const CreateLeadSchema = z.object({
  nom: z.string().min(1).max(200),
  entreprise: z.string().max(200).optional(),
  courriel: z.string().email(),
  telephone: z.string().min(1).max(30),
  service: z.string().min(1).max(50),
  message: z.string().max(2000).optional(),
});

const LEAD_STATUSES = ["nouveau", "contacte", "qualifie", "proposition", "gagne", "perdu"] as const;

const UpdateLeadSchema = z.object({
  status: z.enum(LEAD_STATUSES),
});

const CreateVisitSchema = z.object({
  sessionId: z.string().min(1).max(200),
});

const UpdateVisitSchema = z.object({
  durationSeconds: z.number().int().min(0).optional(),
  converted: z.boolean().optional(),
});

// ─── Auth ────────────────────────────────────────────────────────────────────

function requireAdmin(req: Request): boolean {
  const provided = req.headers["x-admin-password"];
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !provided) return false;
  return provided === expected;
}

// ─── Sanitization ────────────────────────────────────────────────────────────

function sanitize(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/[<>]/g, "").trim();
}

function sanitizeObject(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = typeof v === "string" ? sanitize(v) : v;
  }
  return out;
}

// ─── Express app ─────────────────────────────────────────────────────────────

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  })
);

const ALLOWED_ORIGINS = [
  "https://agmds.com",
  /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/,
  // Allow local dev
  /^http:\/\/localhost(:\d+)?$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = ALLOWED_ORIGINS.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );
      callback(null, allowed);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Admin-Password"],
    credentials: false,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// ─── Health check ────────────────────────────────────────────────────────────

app.get("/api/healthz", (_req, res) => res.json({ ok: true }));

// ─── Lead routes ─────────────────────────────────────────────────────────────

const leadSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de soumissions. Veuillez réessayer dans quelques minutes." },
});

// POST /api/leads — public
app.post("/api/leads", leadSubmitLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Données invalides." });
    return;
  }
  const clean = sanitizeObject(parsed.data as Record<string, unknown>);
  const finalParsed = CreateLeadSchema.safeParse(clean);
  if (!finalParsed.success) {
    res.status(400).json({ error: "Données invalides." });
    return;
  }
  const [lead] = await db.insert(leadsTable).values(finalParsed.data).returning();
  res.status(201).json(lead);
});

// GET /api/leads — admin only
app.get("/api/leads", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const leads = await db.select().from(leadsTable).orderBy(desc(leadsTable.createdAt));
  res.json(leads);
});

// GET /api/leads/summary — admin only
app.get("/api/leads/summary", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await db
    .select({ status: leadsTable.status, count: sql<number>`count(*)::int` })
    .from(leadsTable)
    .groupBy(leadsTable.status);
  const countByStatus = new Map(rows.map((r) => [r.status, r.count]));
  const groups = LEAD_STATUSES.map((status) => ({ status, count: countByStatus.get(status) ?? 0 }));
  const total = groups.reduce((sum, g) => sum + g.count, 0);
  res.json({ total, groups });
});

// PATCH /api/leads/:id — admin only
app.patch("/api/leads/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = req.params["id"] as string;
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  const parsed = UpdateLeadSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Données invalides." }); return; }
  const [lead] = await db
    .update(leadsTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(leadsTable.id, id))
    .returning();
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  res.json(lead);
});

// DELETE /api/leads/:id — admin only
app.delete("/api/leads/:id", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = req.params["id"] as string;
  if (!id) { res.status(400).json({ error: "Missing id" }); return; }
  const [lead] = await db.delete(leadsTable).where(eq(leadsTable.id, id)).returning();
  if (!lead) { res.status(404).json({ error: "Lead not found" }); return; }
  res.status(204).send();
});

// ─── Visit routes ─────────────────────────────────────────────────────────────

// POST /api/visits — upsert visit session
app.post("/api/visits", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateVisitSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Données invalides." }); return; }
  const [visit] = await db
    .insert(visitsTable)
    .values({ sessionId: parsed.data.sessionId })
    .onConflictDoNothing({ target: visitsTable.sessionId })
    .returning();
  if (visit) { res.status(201).json(visit); return; }
  const [existing] = await db.select().from(visitsTable).where(eq(visitsTable.sessionId, parsed.data.sessionId));
  res.status(201).json(existing);
});

// PATCH /api/visits/:sessionId — heartbeat
app.patch("/api/visits/:sessionId", async (req: Request, res: Response): Promise<void> => {
  const sessionId = req.params["sessionId"] as string;
  if (!sessionId) { res.status(400).json({ error: "Missing sessionId" }); return; }
  const parsed = UpdateVisitSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Données invalides." }); return; }

  // Duration only ever increases; converted stays true once set
  const updates: Record<string, unknown> = { lastSeenAt: new Date() };
  if (parsed.data.durationSeconds !== undefined) {
    updates.durationSeconds = sql`GREATEST(${visitsTable.durationSeconds}, ${parsed.data.durationSeconds})`;
  }
  if (parsed.data.converted !== undefined) {
    updates.converted = sql`${visitsTable.converted} OR ${parsed.data.converted}`;
  }

  const [visit] = await db
    .update(visitsTable)
    .set(updates)
    .where(eq(visitsTable.sessionId, sessionId))
    .returning();
  if (!visit) { res.status(404).json({ error: "Visit not found" }); return; }
  res.json(visit);
});

// GET /api/visits/stats — admin only
app.get("/api/visits/stats", async (req: Request, res: Response): Promise<void> => {
  if (!requireAdmin(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

  const now = new Date();
  const since24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const since7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  async function windowStats(since: Date) {
    const [row] = await db
      .select({
        count: sql<number>`count(*)::int`,
        avgDurationSeconds: sql<number>`COALESCE(AVG(${visitsTable.durationSeconds}), 0)::int`,
        converted: sql<number>`COUNT(*) FILTER (WHERE ${visitsTable.converted})::int`,
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

// ─── Serve frontend (Vite build output) ──────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "../dist");

app.use(express.static(distPath));

// SPA fallback — all non-API routes serve index.html
app.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ─── Global error handler ─────────────────────────────────────────────────────

app.use(
  (
    err: Error & { status?: number; type?: string },
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    if (err.type === "entity.too.large" || err.status === 413) {
      res.status(413).json({ error: "Requête trop volumineuse." });
      return;
    }
    console.error("[API Error]", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
);

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
migrate().then(() => {
  app.listen(PORT, () => {
    console.log(`[MDS] Server running on port ${PORT}`);
  });
});
