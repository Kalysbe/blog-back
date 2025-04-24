import mongoose from 'mongoose';

const TrackerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Contents', TrackerSchema);
