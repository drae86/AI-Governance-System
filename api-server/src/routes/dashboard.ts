import { Router, type IRouter } from "express";
import { desc, sql, avg, count } from "drizzle-orm";
import { db, candidatesTable, evaluationsTable, governanceRulesTable, lineageEventsTable } from "@workspace/db";
import { GetRecentActivityQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [totals] = await db.select({
    total: count(),
    deployed: sql<number>`count(*) filter (where ${candidatesTable.stage} = 'deployed')`,
    rejected: sql<number>`count(*) filter (where ${candidatesTable.stage} = 'rejected')`,
    active: sql<number>`count(*) filter (where ${candidatesTable.stage} not in ('deployed','rejected'))`,
    maxGen: sql<number>`coalesce(max(${candidatesTable.generation}), 0)`,
  }).from(candidatesTable);

  const [evalAvgs] = await db.select({
    avgSafety: avg(evaluationsTable.safetyScore),
    avgCapability: avg(evaluationsTable.capabilityScore),
  }).from(evaluationsTable);

  const [ruleCount] = await db.select({ count: count() }).from(governanceRulesTable);

  res.json({
    totalCandidates: Number(totals.total),
    deployedCandidates: Number(totals.deployed),
    rejectedCandidates: Number(totals.rejected),
    activePipeline: Number(totals.active),
    averageSafetyScore: Number(evalAvgs.avgSafety ?? 0),
    averageCapabilityScore: Number(evalAvgs.avgCapability ?? 0),
    totalGenerations: Number(totals.maxGen),
    rulesEnforced: Number(ruleCount.count),
  });
});

router.get("/dashboard/activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const limit = query.data.limit ?? 20;
  const rows = await db.select().from(lineageEventsTable).orderBy(desc(lineageEventsTable.createdAt)).limit(limit);

  res.json(rows.map(r => ({
    id: r.id,
    candidateId: r.candidateId,
    candidateName: r.candidateName,
    eventType: r.eventType,
    description: r.description,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.get("/dashboard/pipeline-flow", async (_req, res): Promise<void> => {
  const rows = await db.select({
    stage: candidatesTable.stage,
    count: count(),
  }).from(candidatesTable).groupBy(candidatesTable.stage);

  const flow: Record<string, number> = {
    proposed: 0, training: 0, evaluating: 0, governing: 0, approved: 0, rejected: 0, deployed: 0,
  };
  for (const row of rows) {
    if (row.stage in flow) flow[row.stage] = Number(row.count);
  }

  res.json(flow);
});

export default router;
