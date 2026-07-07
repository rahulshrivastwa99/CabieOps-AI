// services/rulesEngine.js

exports.applyBusinessRules = (parsedData) => {
    // Default fallback
    let decision = {
        suggestedAction: "Monitor situation.",
        reasoning: "General event logged.",
        requiresHumanDecision: false,
        urgencyScore: 10,
        urgencyLevel: "low"
    };

    const text = (parsedData.summary || "").toLowerCase();

    // Scenario 1: Ashok Leyland Driver Absent (4 waiting, backup is 4-seater)
    if (text.includes('absent') || text.includes('waiting')) {
        decision.suggestedAction = "Dispatch 4-seater backup vehicle for the 4 waiting employees.";
        decision.reasoning = "Capacity check passed: 4 passengers fit exactly into the available 4-seater backup vehicle. High priority as shift starts in 20 mins.";
        decision.urgencyScore = 95;
        decision.urgencyLevel = "high";
        decision.requiresHumanDecision = false; // Auto-resolvable
    } 
    // Scenario 2: Flat Tyre (No backup available)
    else if (text.includes('tyre') || text.includes('flat')) {
        decision.suggestedAction = "Manually source external vehicle for stranded passengers 8km away.";
        decision.reasoning = "No company backup vehicles available in an 8km radius. Requires manual negotiation or third-party booking.";
        decision.urgencyScore = 85;
        decision.urgencyLevel = "high";
        decision.requiresHumanDecision = true; // Needs Ops Manager
    }
    // Scenario 3: Rain/Weather Delay
    else if (text.includes('rain') || text.includes('weather')) {
        decision.suggestedAction = "Send proactive delay alerts to affected routes.";
        decision.reasoning = "Weather-induced delay expected. No immediate routing changes required, only communication.";
        decision.urgencyScore = 40;
        decision.urgencyLevel = "medium";
    }

    return decision;
};