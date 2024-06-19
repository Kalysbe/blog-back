import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Client', ClientSchema);
