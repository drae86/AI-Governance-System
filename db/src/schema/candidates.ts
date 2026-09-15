import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const candidatesTable = pgTable("candidates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  stage: text("stage").notNull().default("proposed"),
  architectureType: text("architecture_type").notNull(),
  datasets: text("datasets"),
  hyperparameters: text("hyperparameters"),
  rejectionReason: text("rejection_reason"),
  parentId: integer("parent_id"),
  generation: integer("generation").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertCandidateSchema = createInsertSchema(candidatesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidatesTable.$inferSelect;

export const evaluationsTable = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  capabilityScore: real("capability_score").notNull(),
  safetyScore: real("safety_score").notNull(),
  costScore: real("cost_score").notNull(),
  robustnessScore: real("robustness_score").notNull(),
  latencyMs: integer("latency_ms"),
  overallScore: real("overall_score").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEvaluationSchema = createInsertSchema(evaluationsTable).omit({ id: true, createdAt: true });
export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluationsTable.$inferSelect;
