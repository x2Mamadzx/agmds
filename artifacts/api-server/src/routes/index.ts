import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leadsRouter from "./leads";
import visitsRouter from "./visits";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leadsRouter);
router.use(visitsRouter);

export default router;
