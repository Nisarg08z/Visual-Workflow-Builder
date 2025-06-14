import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Workflow from "../models/workflow.model.js"; 
import WorkflowExecution from "../models/workflowExecution.model.js"; 
import { spawn } from 'child_process';
import path from 'path'; 
import dotenv from 'dotenv'; 

dotenv.config({
    path: './.env' 
});

const PYTHON_EXECUTOR_SCRIPT = path.resolve(process.cwd(), '..', 'Compiler', 'workflow_executor.py');

// --- Initiate a workflow run (and record history) ---
const runWorkflow = asyncHandler(async (req, res) => {
    const { workflowId, inputData = {} } = req.body;
    const userId = req.user._id;

    if (!workflowId) {
        throw new ApiError(400, "Workflow ID is required to run a workflow");
    }

    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) {
        throw new ApiError(404, "Workflow not found or you don't have permission to run it");
    }

    const newExecution = await WorkflowExecution.create({
        workflowId: workflow._id,
        userId: userId,
        executedAt: new Date(),
        status: 'pending',
        inputData: inputData,
        logs: [{ timestamp: new Date().toISOString(), level: 'info', message: 'Workflow execution requested.' }]
    });

    res.status(202).json(
        new ApiResponse(202, { executionId: newExecution._id }, "Workflow execution initiated")
    );

    console.log(`Node.js: Initiating Python execution for workflow ${workflow._id}, execution ${newExecution._id}`);

    const startTime = Date.now();
    let executionStatus = 'failed'; 
    let outputData = {};
    let errorDetails = null;
    let accumulatedLogs = newExecution.logs; 

    try {

        const pythonProcess = spawn('python', [
            PYTHON_EXECUTOR_SCRIPT,
            JSON.stringify(workflow.toObject()), // Full workflow definition
            JSON.stringify(inputData),          // Initial input for the workflow
            newExecution._id.toString(),        // Use MongoDB execution ID as LangGraph thread ID
            process.env.MONGO_URI               // MongoDB connection string for LangGraph's checkpointer
        ], {
            env: {
                ...process.env, // Pass all current env vars
                OPENAI_API_KEY: process.env.OPENAI_API_KEY, // Explicitly pass OpenAI API key
            }
        });

        let pythonStdout = '';
        let pythonStderr = '';

        pythonProcess.stdout.on('data', (data) => {
            pythonStdout += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            pythonStderr += data.toString();
        });

        await new Promise((resolve, reject) => {
            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    // Python script exited with an error
                    const errorMessage = `Python process exited with code ${code}. Stderr: ${pythonStderr || 'No stderr output.'}`;
                    accumulatedLogs.push({ timestamp: new Date().toISOString(), level: 'error', message: errorMessage });
                    console.error('Node.js Error (Python process exit):', errorMessage);
                    reject(new Error(errorMessage));
                } else {

                    try {
                        const pythonResult = JSON.parse(pythonStdout);
                        executionStatus = pythonResult.status;
                        outputData = pythonResult.output_data || {};

                        if (pythonResult.logs && Array.isArray(pythonResult.logs)) {
                            accumulatedLogs = accumulatedLogs.concat(pythonResult.logs);
                        }
                        if (pythonResult.error) {
                            errorDetails = { message: pythonResult.error };
                        }
                        resolve();
                    } catch (parseError) {
                        const errorMessage = `Error parsing Python stdout JSON: ${parseError.message}. Raw output: ${pythonStdout}`;
                        accumulatedLogs.push({ timestamp: new Date().toISOString(), level: 'error', message: errorMessage });
                        console.error('Node.js Error (JSON parsing):', errorMessage);
                        reject(new Error(errorMessage));
                    }
                }
            });

            pythonProcess.on('error', (err) => {
                const errorMessage = `Failed to start Python process: ${err.message}. Check if Python is installed and script path is correct.`;
                accumulatedLogs.push({ timestamp: new Date().toISOString(), level: 'error', message: errorMessage });
                console.error('Node.js Error (spawn):', errorMessage);
                reject(new Error(errorMessage));
            });
        });

    } catch (execError) {

        executionStatus = 'failed';
        errorDetails = { message: execError.message, stack: execError.stack };
        accumulatedLogs.push({ timestamp: new Date().toISOString(), level: 'error', message: `Node.js orchestrator error: ${execError.message}` });
        console.error('Node.js Execution Orchestration Error:', execError);
    } finally {
        const durationMs = Date.now() - startTime;
        accumulatedLogs.push({ timestamp: new Date().toISOString(), level: 'info', message: `Workflow execution finished with final status: ${executionStatus}` });

        await WorkflowExecution.findByIdAndUpdate(newExecution._id, {
            status: executionStatus,
            outputData: outputData,
            logs: accumulatedLogs,
            error: errorDetails,
            durationMs: durationMs,
        }, { new: true }); 

        console.log(`Node.js: Workflow ${workflow._id} execution ${newExecution._id} finished with status: ${executionStatus}`);
    }
});

// --- Get all workflow executions for a specific workflow or user ---
const getWorkflowExecutions = asyncHandler(async (req, res) => {
    const { workflowId } = req.query; 
    const userId = req.user._id; 

    const query = { userId };
    if (workflowId) {
        query.workflowId = workflowId;
    }

    const executions = await WorkflowExecution.find(query)
        .populate('workflowId', 'workflowName') 
        .sort({ executedAt: -1 }) 
        .limit(50); 

    return res
        .status(200)
        .json(new ApiResponse(200, executions, "Workflow executions fetched successfully"));
});

// --- Get a single workflow execution by ID ---
const getWorkflowExecutionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Execution ID is required");
    }

    const execution = await WorkflowExecution.findOne({ _id: id, userId })
        .populate('workflowId', 'workflowName nodes edges'); // Populate workflow details

    if (!execution) {
        throw new ApiError(404, "Workflow execution not found or you don't have permission to access it");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, execution, "Workflow execution details fetched successfully"));
});

export {
    runWorkflow,
    getWorkflowExecutions,
    getWorkflowExecutionById,
};
