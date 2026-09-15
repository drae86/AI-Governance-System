import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const governanceRulesTable = pgTable("governance_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGovernanceRuleSchema = createInsertSchema(governanceRulesTable).omit({ id: true, createdAt: true });
export type InsertGovernanceRule = z.infer<typeof insertGovernanceRuleSchema>;
export type GovernanceRule = typeof governanceRulesTable.$inferSelect;

export const lineageEventsTable = pgTable("lineage_events", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  candidateName: text("candidate_name").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLineageEventSchema = createInsertSchema(lineageEventsTable).omit({ id: true, createdAt: true });
export type InsertLineageEvent = z.infer<typeof insertLineageEventSchema>;
export type LineageEvent = typeof lineageEventsTable.$inferSelect;
