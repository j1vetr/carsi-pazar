import { Router, type IRouter } from "express";
import healthRouter from "./health";
import haremRouter from "./harem";

const router: IRouter = Router();

router.use(healthRouter);
router.use(haremRouter);

export default router;
