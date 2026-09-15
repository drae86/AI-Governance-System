import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, governanceRulesTable } from "@workspace/db";
import {
  CreateGovernanceRuleBody,
  DeleteGovernanceRuleParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatRule(r: typeof governanceRulesTable.$inferSelect) {
  return {
    ...r,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/governance/rules", async (_req, res): Promise<void> => {
  const rows = await db.select().from(governanceRulesTable).orderBy(desc(governanceRulesTable.createdAt));
  res.json(rows.map(formatRule));
});

router.post("/governance/rules", async (req, res): Promise<void> => {
  const parsed = CreateGovernanceRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rule] = await db.insert(governanceRulesTable).values({
    name: parsed.data.name,
    category: parsed.data.category,
    description: parsed.data.description,
    severity: parsed.data.severity,
    active: true,
  }).returning();

  res.status(201).json(formatRule(rule));
});

router.delete("/governance/rules/:id", async (req, res): Promise<void> => {
  const params = DeleteGovernanceRuleParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [rule] = await db.delete(governanceRulesTable).where(eq(governanceRulesTable.id, params.data.id)).returning();
  if (!rule) {
    res.status(404).json({ error: "Rule not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
