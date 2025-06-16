import { Router } from "express";
import {
    createConnection,
    getConnections,
    getConnectionById,
    updateConnection,
    deleteConnection
} from "../controllers/connection.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/")
    .post(createConnection)
    .get(getConnections);

router.route("/:id")
    .get(getConnectionById)
    .patch(updateConnection)
    .delete(deleteConnection);

export default router;
