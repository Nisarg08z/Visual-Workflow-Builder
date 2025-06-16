import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Workflow from "../models/workflow.model.js";
import WorkflowExecution from "../models/workflowExecution.model.js";
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { PYTHON_EXECUTOR_SCRIPT } from "../config/constants.js";

dotenv.config({ path: './.env' });

const MAX_LOG_OUTPUT_LENGTH = 5000;

const pushLog = (logs, level, message) => {
    logs.push({
        timestamp: new Date().toISOString(),
        level,
        message
    });
};

const runWorkflow = asyncHandler(async (req, res) => {
    const { workflowId, inputData = {}, executionName } = req.body;
    const userId = req.user._id;

    if (!workflowId) throw new ApiError(400, "Workflow ID is required to run a workflow");
    if (typeof inputData !== 'object') throw new ApiError(400, "Input data must be an object");

    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) throw new ApiError(404, "Workflow not found or access denied");

    const now = new Date();
    const newExecution = await WorkflowExecution.create({
        workflowId: workflow._id,
        userId,
        executedAt: now,
        executionName: executionName || `Execution ${now.toLocaleString()}`,
        status: 'pending',
        inputData,
        logs: [{
            timestamp: now.toISOString(),
            level: 'info',
            message: 'Workflow execution requested.'
        }]
    });

    res.status(202).json(
        new ApiResponse(202, { executionId: newExecution._id }, "Workflow execution initiated")
    );

    console.log(`Node.js: Starting execution for workflow ${workflow._id}, execution ${newExecution._id}`);

    const startTime = Date.now();
    let executionStatus = 'failed';
    let outputData = {};
    let errorDetails = null;
    let accumulatedLogs = [...newExecution.logs];

    try {
        const pythonProcess = spawn('python', [
            PYTHON_EXECUTOR_SCRIPT,
            JSON.stringify(workflow.toObject()),
            JSON.stringify(inputData),
            newExecution._id.toString(),
            process.env.MONGO_URI
        ], {
            env: {
                ...process.env,
                OPENAI_API_KEY: process.env.OPENAI_API_KEY
            },
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        let pythonStdout = '';
        let pythonStderr = '';

        pythonProcess.stdout.setEncoding('utf8');
        pythonProcess.stderr.setEncoding('utf8');

        pythonProcess.stdout.on('data', data => { pythonStdout += data; });
        pythonProcess.stderr.on('data', data => { pythonStderr += data; });

        await new Promise((resolve, reject) => {
            pythonProcess.on('close', code => {
                if (pythonStdout.length > MAX_LOG_OUTPUT_LENGTH) {
                    pythonStdout = pythonStdout.slice(0, MAX_LOG_OUTPUT_LENGTH) + '... [truncated]';
                    pushLog(accumulatedLogs, 'warn', 'Python stdout truncated due to size.');
                }

                if (code !== 0) {
                    const msg = `Python exited with code ${code}. Stderr: ${pythonStderr || 'No stderr.'}`;
                    pushLog(accumulatedLogs, 'error', msg);
                    return reject(new Error(msg));
                }

                try {
                    const pythonResult = JSON.parse(pythonStdout);
                    executionStatus = pythonResult.status || 'failed';
                    outputData = pythonResult.output_data || {};
                    if (Array.isArray(pythonResult.logs)) {
                        accumulatedLogs.push(...pythonResult.logs);
                    }
                    if (pythonResult.error) {
                        errorDetails = { message: pythonResult.error };
                    }
                    resolve();
                } catch (err) {
                    const msg = `Failed to parse Python JSON: ${err.message}. Raw output: ${pythonStdout}`;
                    pushLog(accumulatedLogs, 'error', msg);
                    reject(new Error(msg));
                }
            });

            pythonProcess.on('error', err => {
                const msg = `Failed to spawn Python process: ${err.message}`;
                pushLog(accumulatedLogs, 'error', msg);
                reject(new Error(msg));
            });
        });

    } catch (err) {
        executionStatus = 'failed';
        errorDetails = { message: err.message, stack: err.stack };
        pushLog(accumulatedLogs, 'error', `Node.js error: ${err.message}`);
    } finally {
        const durationMs = Date.now() - startTime;
        pushLog(accumulatedLogs, 'info', `Execution finished with status: ${executionStatus}`);

        await WorkflowExecution.findByIdAndUpdate(newExecution._id, {
            status: executionStatus,
            outputData,
            logs: accumulatedLogs,
            error: errorDetails,
            durationMs
        }, { new: true });

        console.log(`Workflow ${workflow._id} execution ${newExecution._id} completed with status: ${executionStatus}`);
    }
});

const getWorkflowExecutions = asyncHandler(async (req, res) => {
    const { workflowId } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (workflowId) query.workflowId = workflowId;

    const executions = await WorkflowExecution.find(query)
        .populate('workflowId', 'workflowName')
        .sort({ executedAt: -1 })
        .limit(50);

    res.status(200).json(
        new ApiResponse(200, executions, "Workflow executions fetched successfully")
    );
});

const getWorkflowExecutionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) throw new ApiError(400, "Execution ID is required");

    const execution = await WorkflowExecution.findOne({ _id: id, userId })
        .populate('workflowId', 'workflowName nodes edges');

    if (!execution) {
        throw new ApiError(404, "Workflow execution not found or access denied");
    }

    res.status(200).json(
        new ApiResponse(200, execution, "Workflow execution details fetched successfully")
    );
});

export {
    runWorkflow,
    getWorkflowExecutions,
    getWorkflowExecutionById,
};
