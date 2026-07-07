// controllers/incidentController.js
const { parseIncidentWithLLM, draftMessagesWithLLM } = require('../services/llmService');
const { applyBusinessRules } = require('../services/rulesEngine');
const Incident = require('../models/Incident');

exports.processIncident = async (req, res) => {
    try {
        const { rawText } = req.body;
        
        if (!rawText) {
            return res.status(400).json({ success: false, error: "Raw text is required" });
        }

        // 1. LLM Parses Text (Chaos -> Structured Data)
        const parsedData = await parseIncidentWithLLM(rawText);

        // 2. Rules Engine decides Action (Deterministic Math)
        const routingDecision = applyBusinessRules(parsedData);

        // 3. LLM Drafts Messages based on the rule engine's decision
        const drafts = await draftMessagesWithLLM(parsedData, routingDecision);

        // 4. Save everything to MongoDB
        const newIncident = new Incident({
            ...parsedData,
            suggestedAction: routingDecision.suggestedAction,
            reasoning: routingDecision.reasoning,
            requiresHumanDecision: routingDecision.requiresHumanDecision,
            urgencyScore: routingDecision.urgencyScore,
            urgencyLevel: routingDecision.urgencyLevel,
            drafts: drafts
        });
        
        await newIncident.save();

        // 5. Send real-time update to React Frontend via Socket.io
        if (req.io) {
            req.io.emit('new_incident', newIncident);
        }

        res.status(200).json({ success: true, data: newIncident });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({ success: false, error: "Failed to process incident" });
    }
};

exports.getIncidents = async (req, res) => {
    try {
        // Fetch all incidents sorted by urgencyScore descending
        const incidents = await Incident.find().sort({ urgencyScore: -1 }).lean();
        res.status(200).json({ success: true, data: incidents });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ success: false, error: "Failed to fetch incidents" });
    }
};

exports.updateActionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'approved' or 'escalated'
        
        const incident = await Incident.findByIdAndUpdate(id, { actionStatus: status }, { new: true });
        if (!incident) return res.status(404).json({ success: false, error: "Incident not found" });
        
        if (req.io) req.io.emit('incident_updated', incident);
        res.status(200).json({ success: true, data: incident });
    } catch (error) {
        console.error("Update Action Error:", error);
        res.status(500).json({ success: false, error: "Failed to update action status" });
    }
};

exports.updateDraft = async (req, res) => {
    try {
        const { id, draftId } = req.params;
        const { message, sent } = req.body;

        const updateFields = {};
        if (message !== undefined) {
            updateFields['drafts.$.message'] = message;
            updateFields['drafts.$.edited'] = true;
        }
        if (sent !== undefined) {
            updateFields['drafts.$.sent'] = sent;
        }

        const incident = await Incident.findOneAndUpdate(
            { _id: id, "drafts._id": draftId },
            { $set: updateFields },
            { new: true }
        );
        
        if (!incident) return res.status(404).json({ success: false, error: "Incident or draft not found" });

        // Check if all drafts are sent
        if (incident.drafts.every(d => d.sent)) {
            incident.status = 'resolved';
            incident.resolvedAt = new Date();
            await incident.save();
        }

        if (req.io) req.io.emit('incident_updated', incident);
        res.status(200).json({ success: true, data: incident });
    } catch (error) {
        console.error("Update Draft Error:", error);
        res.status(500).json({ success: false, error: "Failed to update draft" });
    }
};