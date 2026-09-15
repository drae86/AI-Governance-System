import { Router, type IRouter } from "express";
import healthRouter from "./health";
import candidatesRouter from "./candidates";
import evaluationsRouter from "./evaluations";
import governanceRouter from "./governance";
import lineageRouter from "./lineage";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(candidatesRouter);
router.use(evaluationsRouter);
router.use(governanceRouter);
router.use(lineageRouter);
router.use(dashboardRouter);

export default router;
