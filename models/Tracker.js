import mongoose from 'mongoose';

const TrackerSchema = new mongoose.Schema(
    {
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: false,
        },
        deviceType: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        },
        referer: {
            type: String,
            required: false,
        }
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Tracker', TrackerSchema);
