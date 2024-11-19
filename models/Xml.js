import mongoose from 'mongoose';

const XmlSchema = new mongoose.Schema(
    {
        company: {
            type: String,
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        data: {
            type: Object,
            required: false,
        },
    },
    {
        timestamps: true,
    },
);

export default mongoose.model('Xml', XmlSchema);
