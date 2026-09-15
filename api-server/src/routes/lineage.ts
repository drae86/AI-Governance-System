import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, lineageEventsTable } from "@workspace/db";
import { ListLineageEventsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/lineage", async (req, res): Promise<void> => {
  const query = ListLineageEventsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let q = db.select().from(lineageEventsTable).$dynamic();
  if (query.data.candidateId) {
    q = q.where(eq(lineageEventsTable.candidateId, query.data.candidateId));
  }
  const limit = query.data.limit ?? 100;
  const rows = await q.orderBy(desc(lineageEventsTable.createdAt)).limit(limit);

  res.json(rows.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;
