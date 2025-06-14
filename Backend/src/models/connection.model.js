import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        connectionName: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        serviceType: {
            type: String,
            required: true,
            trim: true,
        },
        credentials: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },
    }, {
    timestamps: true, 
    collection: 'connections' 
});

connectionSchema.index({ userId: 1, connectionName: 1 }, { unique: true });

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;