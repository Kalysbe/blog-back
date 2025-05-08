import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Contact', ContactSchema);
