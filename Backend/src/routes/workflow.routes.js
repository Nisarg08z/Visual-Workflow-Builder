import { Router } from "express";
import {
    createWorkflow,
    getWorkflows,
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow
} from "../controllers/workflow.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createWorkflow)
    .get(getWorkflows);

router.route("/:id")
    .get(getWorkflowById)
    .patch(updateWorkflow)
    .delete(deleteWorkflow);

export default router;
