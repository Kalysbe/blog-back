import mongoose from 'mongoose';

const TrackerSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        deviceType: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        referer: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Tracker', TrackerSchema);
