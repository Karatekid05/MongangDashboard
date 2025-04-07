const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['points', 'join', 'leave', 'create', 'update', 'system'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gangId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Gang'
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
ActivitySchema.index({ type: 1 });
ActivitySchema.index({ userId: 1 });
ActivitySchema.index({ gangId: 1 });
ActivitySchema.index({ timestamp: -1 });
ActivitySchema.index({ type: 1, timestamp: -1 });
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ gangId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', ActivitySchema); 