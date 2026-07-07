const mongoose = require('mongoose');

const draftSchema = new mongoose.Schema({
    audience: { type: String },
    message: { type: String },
    edited: { type: Boolean, default: false },
    sent: { type: Boolean, default: false }
});

const incidentSchema = new mongoose.Schema({
    type: { type: String },
    route: { type: String },
    client: { type: String },
    driver: { type: String },
    summary: { type: String },
    suggestedAction: { type: String },
    reasoning: { type: String },
    requiresHumanDecision: { type: Boolean },
    urgencyScore: { type: Number },
    urgencyLevel: { type: String },
    drafts: [draftSchema],
    status: { type: String, default: 'open' }, // open, resolved
    actionStatus: { type: String, default: 'pending' }, // pending, approved, escalated
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
});

module.exports = mongoose.model('Incident', incidentSchema);
