import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadStatuses = [
  "nouveau",
  "contacte",
  "qualifie",
  "proposition",
  "gagne",
  "perdu",
] as const;

export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  entreprise: text("entreprise"),
  courriel: text("courriel").notNull(),
  telephone: text("telephone"),
  service: text("service").notNull(),
  message: text("message"),
  status: text("status").notNull().default("nouveau"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;
