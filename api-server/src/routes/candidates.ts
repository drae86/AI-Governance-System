import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, candidatesTable, evaluationsTable, lineageEventsTable } from "@workspace/db";
import {
  ListCandidatesQueryParams,
  CreateCandidateBody,
  GetCandidateParams,
  UpdateCandidateParams,
  UpdateCandidateBody,
  DeleteCandidateParams,
  AdvanceCandidateParams,
  RejectCandidateParams,
  RejectCandidateBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const STAGE_ORDER = ["proposed", "training", "evaluating", "governing", "approved", "deployed"] as const;

function formatCandidate(c: typeof candidatesTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

router.get("/candidates", async (req, res): Promise<void> => {
  const query = ListCandidatesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let q = db.select().from(candidatesTable).$dynamic();
  if (query.data.status) {
    q = q.where(eq(candidatesTable.stage, query.data.status));
  }
  const limit = query.data.limit ?? 50;
  const rows = await q.orderBy(desc(candidatesTable.createdAt)).limit(limit);
  res.json(rows.map(formatCandidate));
});

router.post("/candidates", async (req, res): Promise<void> => {
  const parsed = CreateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const parentGeneration = parsed.data.parentId
    ? (await db.select().from(candidatesTable).where(eq(candidatesTable.id, parsed.data.parentId)))[0]?.generation ?? 0
    : 0;

  const [candidate] = await db.insert(candidatesTable).values({
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    stage: "proposed",
    architectureType: parsed.data.architectureType,
    datasets: parsed.data.datasets ?? null,
    hyperparameters: parsed.data.hyperparameters ?? null,
    parentId: parsed.data.parentId ?? null,
    generation: parentGeneration + 1,
  }).returning();

  await db.insert(lineageEventsTable).values({
    candidateId: candidate.id,
    candidateName: candidate.name,
    eventType: "proposed",
    description: `Architect proposed ${candidate.name} (${candidate.architectureType})`,
  });

  res.status(201).json(formatCandidate(candidate));
});

router.get("/candidates/:id", async (req, res): Promise<void> => {
  const params = GetCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json(formatCandidate(candidate));
});

router.patch("/candidates/:id", async (req, res): Promise<void> => {
  const params = UpdateCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db.update(candidatesTable)
    .set(parsed.data)
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.json(formatCandidate(candidate));
});

router.delete("/candidates/:id", async (req, res): Promise<void> => {
  const params = DeleteCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db.delete(candidatesTable).where(eq(candidatesTable.id, params.data.id)).returning();
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/candidates/:id/advance", async (req, res): Promise<void> => {
  const params = AdvanceCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const currentIndex = STAGE_ORDER.indexOf(candidate.stage as typeof STAGE_ORDER[number]);
  if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
    res.status(400).json({ error: "Candidate cannot be advanced further" });
    return;
  }

  const nextStage = STAGE_ORDER[currentIndex + 1];
  const [updated] = await db.update(candidatesTable)
    .set({ stage: nextStage })
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  const eventTypeMap: Record<string, string> = {
    training: "training_started",
    evaluating: "evaluation_complete",
    governing: "governance_passed",
    approved: "governance_passed",
    deployed: "deployed",
  };

  await db.insert(lineageEventsTable).values({
    candidateId: candidate.id,
    candidateName: candidate.name,
    eventType: eventTypeMap[nextStage] ?? "proposed",
    description: `${candidate.name} advanced to ${nextStage}`,
  });

  res.json(formatCandidate(updated));
});

router.post("/candidates/:id/reject", async (req, res): Promise<void> => {
  const params = RejectCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = RejectCandidateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [candidate] = await db.select().from(candidatesTable).where(eq(candidatesTable.id, params.data.id));
  if (!candidate) {
    res.status(404).json({ error: "Candidate not found" });
    return;
  }

  const [updated] = await db.update(candidatesTable)
    .set({ stage: "rejected", rejectionReason: parsed.data.reason })
    .where(eq(candidatesTable.id, params.data.id))
    .returning();

  await db.insert(lineageEventsTable).values({
    candidateId: candidate.id,
    candidateName: candidate.name,
    eventType: "governance_failed",
    description: `Governor rejected ${candidate.name}: ${parsed.data.reason}`,
  });

  res.json(formatCandidate(updated));
});

export default router;
