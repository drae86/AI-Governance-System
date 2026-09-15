import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, evaluationsTable, candidatesTable } from "@workspace/db";
import {
  ListEvaluationsQueryParams,
  CreateEvaluationBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatEval(e: typeof evaluationsTable.$inferSelect) {
  return {
    ...e,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/evaluations", async (req, res): Promise<void> => {
  const query = ListEvaluationsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let q = db.select().from(evaluationsTable).$dynamic();
  if (query.data.candidateId) {
    q = q.where(eq(evaluationsTable.candidateId, query.data.candidateId));
  }
  const rows = await q.orderBy(desc(evaluationsTable.createdAt));
  res.json(rows.map(formatEval));
});

router.post("/evaluations", async (req, res): Promise<void> => {
  const parsed = CreateEvaluationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const overall = (parsed.data.capabilityScore + parsed.data.safetyScore + parsed.data.costScore + parsed.data.robustnessScore) / 4;

  const [evaluation] = await db.insert(evaluationsTable).values({
    candidateId: parsed.data.candidateId,
    capabilityScore: parsed.data.capabilityScore,
    safetyScore: parsed.data.safetyScore,
    costScore: parsed.data.costScore,
    robustnessScore: parsed.data.robustnessScore,
    latencyMs: parsed.data.latencyMs ?? null,
    overallScore: overall,
    notes: parsed.data.notes ?? null,
  }).returning();

  // Log to lineage
  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, parsed.data.candidateId));
  if (candidate) {
    const { lineageEventsTable } = await import("@workspace/db");
    await db.insert(lineageEventsTable).values({
      candidateId: candidate.id,
      candidateName: candidate.name,
      eventType: "evaluation_complete",
      description: `Evaluator scored ${candidate.name}: overall ${overall.toFixed(1)}/100`,
      metadata: JSON.stringify({ capabilityScore: parsed.data.capabilityScore, safetyScore: parsed.data.safetyScore, costScore: parsed.data.costScore, robustnessScore: parsed.data.robustnessScore }),
    });
  }

  res.status(201).json(formatEval(evaluation));
});

export default router;
