import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visitsTable = pgTable("visits", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  converted: boolean("converted").notNull().default(false),
});

export const insertVisitSchema = createInsertSchema(visitsTable).pick({
  sessionId: true,
});
export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = typeof visitsTable.$inferSelect;
