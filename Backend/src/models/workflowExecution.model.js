// models/workflowExecution.model.js
import mongoose from 'mongoose';

const logEntrySchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'debug'],
      default: 'info'
    },
    message: {
      type: String,
      required: true
    },
    nodeId: {
      type: String
    },
    data: {
      type: mongoose.Schema.Types.Mixed
    },
  }
);

const workflowExecutionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workflow',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    executedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'success', 'failed', 'cancelled'],
      default: 'pending',
      required: true,
    },
    durationMs: {
      type: Number,
    },
    inputData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    outputData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    logs: [logEntrySchema],
    error: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'workflow_executions'
  }
);

const WorkflowExecution = mongoose.model('WorkflowExecution', workflowExecutionSchema);

export default WorkflowExecution;