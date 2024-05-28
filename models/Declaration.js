import mongoose from 'mongoose';

const DeclarationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        status: {
            type: Number,
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: Object,
            default: {},
        }
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Declaration', DeclarationSchema);
