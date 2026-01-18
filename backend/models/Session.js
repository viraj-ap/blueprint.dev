import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    stepId: { type: String, default: null },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isAiGenerated: { type: Boolean, default: false } 
});

const PlanStepSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    techStack: [String],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const AnnotationSchema = new mongoose.Schema({
    id: { type: String, required: true },
    blockId: { type: String, required: true },
    startOffset: { type: Number, required: true },
    endOffset: { type: Number, required: true },
    type: { type: String, required: true },
    text: { type: String, default: '' },
    originalText: { type: String, default: '' },
    createdA: { type: Number, default: Date.now },
    author: {
        id: String,
        name: String,
        color: String
    },
    imagePaths: [String],
    startMeta: mongoose.Schema.Types.Mixed,
    endMeta: mongoose.Schema.Types.Mixed
});

const SessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true }, // The URL slug
    projectTitle: { type: String, default: "Untitled Plan" },

    // The Coding Plan
    content: { type: String, default: "" },
    steps: [PlanStepSchema],

    // The Collaborative State
    activeUsers: [{ userId: String, color: String, name: String }],
    comments: [CommentSchema],
    annotations: [AnnotationSchema],

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Session', SessionSchema);
