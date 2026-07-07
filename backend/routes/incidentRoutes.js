const express = require('express');
const router = express.Router();
const { processIncident, getIncidents, updateActionStatus, updateDraft } = require('../controllers/incidentController');

// Jab frontend se raw text aayega, wo is endpoint par hit karega
router.post('/process', processIncident);

// Get priority queue
router.get('/', getIncidents);

// Update action status (approve, escalate)
router.put('/:id/action', updateActionStatus);

// Update draft (edit, send)
router.put('/:id/drafts/:draftId', updateDraft);

module.exports = router;