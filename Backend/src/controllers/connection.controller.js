import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Connection from "../models/connection.model.js";

// --- Create a new connection ---
const createConnection = asyncHandler(async (req, res) => {
    const { connectionName, serviceType, credentials } = req.body;
    const userId = req.user._id;

    if (!connectionName || !serviceType || typeof credentials !== "object") {
        throw new ApiError(400, "Connection name, service type, and valid credentials object are required");
    }

    const existing = await Connection.findOne({ userId, connectionName });
    if (existing) {
        throw new ApiError(409, `Connection "${connectionName}" already exists for this user`);
    }

    const connection = await Connection.create({
        userId,
        connectionName,
        serviceType,
        credentials,
    });

    if (!connection) {
        throw new ApiError(500, "Failed to create connection");
    }

    res.status(201).json(new ApiResponse(201, connection, "Connection created successfully"));
});

// --- Get all connections for the authenticated user ---
const getConnections = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const connections = await Connection.find({ userId }).sort({ connectionName: 1 });

    res.status(200).json(new ApiResponse(200, connections, "Connections fetched successfully"));
});

// --- Get a single connection by ID ---
const getConnectionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Connection ID is required");
    }

    const connection = await Connection.findOne({ _id: id, userId });

    if (!connection) {
        throw new ApiError(404, "Connection not found or access denied");
    }

    res.status(200).json(new ApiResponse(200, connection, "Connection fetched successfully"));
});

// --- Update an existing connection ---
const updateConnection = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { connectionName, serviceType, credentials } = req.body;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Connection ID is required");
    }

    if (
        connectionName === undefined &&
        serviceType === undefined &&
        credentials === undefined
    ) {
        throw new ApiError(400, "No fields provided for update");
    }

    const updateFields = { updatedAt: new Date() };
    if (connectionName) updateFields.connectionName = connectionName;
    if (serviceType) updateFields.serviceType = serviceType;
    if (typeof credentials === "object") updateFields.credentials = credentials;

    const connection = await Connection.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateFields },
        { new: true, runValidators: true }
    );

    if (!connection) {
        throw new ApiError(404, "Connection not found or access denied");
    }

    res.status(200).json(new ApiResponse(200, connection, "Connection updated successfully"));
});

// --- Delete a connection ---
const deleteConnection = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id) {
        throw new ApiError(400, "Connection ID is required");
    }

    const connection = await Connection.findOneAndDelete({ _id: id, userId });

    if (!connection) {
        throw new ApiError(404, "Connection not found or access denied");
    }

    res.status(200).json(new ApiResponse(200, null, "Connection deleted successfully"));
});

export {
    createConnection,
    getConnections,
    getConnectionById,
    updateConnection,
    deleteConnection,
};
