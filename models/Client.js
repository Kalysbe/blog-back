import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        typeBusiness: {
            type: String,
            required: true,
        },
        tax: {
            type: Number,
            required: true,
        },
        finance: {
            type: Object,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Client', ClientSchema);
