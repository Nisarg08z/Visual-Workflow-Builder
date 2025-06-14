import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema(
    {
        id: { 
            type: String, 
            required: true 
        },
        type: { 
            type: String, 
            required: true 
        },
        label: { 
            type: String, 
            required: true 
        },
        x: { 
            type: Number, 
            required: true 
        },
        y: { 
            type: Number, 
            required: true 
        },
        properties: { 
            ype: mongoose.Schema.Types.Mixed, 
            default: {} 
        },
    }
);

const edgeSchema = new mongoose.Schema(
    {
        id: { 
            type: String, 
            required: true 
        },
        source: { 
            type: String, 
            required: true 
        },
        target: { 
            type: String, 
            required: true 
        },
    }
);

const workflowSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        workflowName: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        nodes: [nodeSchema],
        edges: [edgeSchema],
    },
    {
        timestamps: true,
        collection: 'workflows'
    }
);


workflowSchema.index({ userId: 1, workflowName: 1 }, { unique: true });

const Workflow = mongoose.model('Workflow', workflowSchema);

export default Workflow;