import { Router } from "express";
import {
    runWorkflow,
    getWorkflowExecutions,
    getWorkflowExecutionById
} from "../controllers/workflowExecution.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/run").post(runWorkflow);
router.route("/").get(getWorkflowExecutions);
router.route("/:id").get(getWorkflowExecutionById);

export default router;
