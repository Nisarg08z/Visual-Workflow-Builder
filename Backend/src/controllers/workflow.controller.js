import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Workflow from "../models/workflow.model.js";
import { User } from "../models/user.model.js";

// --- Create a new workflow ---
const createWorkflow = asyncHandler(async (req, res) => {
    const { workflowName, description = "", nodes, edges } = req.body;
    const userId = req.user._id;

    if (!workflowName || !Array.isArray(nodes) || !Array.isArray(edges)) {
        throw new ApiError(400, "Workflow name, nodes (array), and edges (array) are required");
    }

    const existingWorkflow = await Workflow.findOne({ userId, workflowName });
    if (existingWorkflow) {
        throw new ApiError(409, `Workflow with name "${workflowName}" already exists`);
    }

    const workflow = await Workflow.create({
        userId,
        workflowName,
        description,
        nodes,
        edges,
    });

    if (!workflow) {
        throw new ApiError(500, "Failed to create workflow");
    }

    await User.findByIdAndUpdate(
        userId,
        { $addToSet: { SaveProject: workflow._id } },
        { new: true }
    );

    res.status(201).json(new ApiResponse(201, workflow, "Workflow created successfully"));
});

// --- Get all workflows for the user ---
const getWorkflows = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const workflows = await Workflow.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json(new ApiResponse(200, workflows, "Workflows fetched successfully"));
});

// --- Get a single workflow by ID ---
const getWorkflowById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Workflow ID is required");
    }

    const workflow = await Workflow.findOne({ _id: id, userId });

    if (!workflow) {
        throw new ApiError(404, "Workflow not found or access denied");
    }

    res.status(200).json(new ApiResponse(200, workflow, "Workflow fetched successfully"));
});

// --- Update an existing workflow ---
const updateWorkflow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { workflowName, description, nodes, edges } = req.body;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Workflow ID is required");
    }

    if (
        workflowName === undefined &&
        description === undefined &&
        nodes === undefined &&
        edges === undefined
    ) {
        throw new ApiError(400, "No fields provided for update");
    }

    const updateFields = { updatedAt: new Date() };
    if (workflowName) updateFields.workflowName = workflowName;
    if (description !== undefined) updateFields.description = description;
    if (Array.isArray(nodes)) updateFields.nodes = nodes;
    if (Array.isArray(edges)) updateFields.edges = edges;

    const workflow = await Workflow.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!workflow) {
        throw new ApiError(404, "Workflow not found or access denied");
    }

    res.status(200).json(new ApiResponse(200, workflow, "Workflow updated successfully"));
});

// --- Delete a workflow ---
const deleteWorkflow = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Workflow ID is required");
    }

    const workflow = await Workflow.findOneAndDelete({ _id: id, userId });

    if (!workflow) {
        throw new ApiError(404, "Workflow not found or access denied");
    }

    await User.findByIdAndUpdate(
        userId,
        { $pull: { SaveProject: workflow._id } },
        { new: true }
    );

    res.status(200).json(new ApiResponse(200, null, "Workflow deleted successfully"));
});

export {
    createWorkflow,
    getWorkflows,
    getWorkflowById,
    updateWorkflow,
    deleteWorkflow,
};
