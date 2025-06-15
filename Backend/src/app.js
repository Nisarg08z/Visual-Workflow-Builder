import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRouter from './routes/user.route.js';
import workflowRouter from './routes/workflow.routes.js';
import workflowExecutionRouter from './routes/workflowExecution.routes.js';
import connectionRouter from './routes/connection.routes.js';

const app = express();

app.use(cors({
    origin: "http://localhost:5173", 
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/workflows", workflowRouter);
app.use("/api/v1/executions", workflowExecutionRouter);
app.use("/api/v1/connections", connectionRouter)



export { app }; 
