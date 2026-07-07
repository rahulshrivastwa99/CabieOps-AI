const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-2.5-flash';

exports.parseIncidentWithLLM = async (rawText) => {
    const prompt = `You are an AI dispatcher for CabieOps, a fleet management system.
Extract structured information from the following raw incident text.

Raw text: "${rawText}"

Respond ONLY with valid JSON matching this schema:
{
  "type": "string (one of: driver_absent, flat_tyre, client_complaint, weather_delay, vehicle_breakdown, traffic_jam)",
  "route": "string (e.g. Route P-07, etc, infer from text or say 'Unknown')",
  "client": "string (e.g. Ashok Leyland, infer from text)",
  "driver": "string (driver name if present)",
  "summary": "string (a concise 1-sentence summary of the issue)"
}`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        return JSON.parse(response.text);
    } catch (error) {
        console.error("LLM Parse Error:", error);
        // Fallback
        return {
            type: rawText.toLowerCase().includes('tyre') ? 'flat_tyre' : 
                  rawText.toLowerCase().includes('absent') ? 'driver_absent' : 'weather_delay',
            route: "Unknown Route",
            client: "Unknown Client",
            driver: "Unknown",
            summary: rawText.substring(0, 50) + "..."
        };
    }
};

exports.draftMessagesWithLLM = async (parsedData, routingDecision) => {
    const prompt = `You are a fleet dispatcher. Write 3 short, professional SMS/WhatsApp messages based on this incident.
    
Incident: ${parsedData.summary}
Decision/Action Taken: ${routingDecision.suggestedAction}

Respond ONLY with a JSON array of objects, with no markdown formatting. Each object must have "audience" (employees, client, or driver) and "message" (the drafted text).

Example output:
[
  { "audience": "employees", "message": "Your cab is delayed..." },
  { "audience": "client", "message": "Delay on route..." },
  { "audience": "driver", "message": "Proceed to..." }
]`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const drafts = JSON.parse(response.text);
        return drafts.map(d => ({ ...d, edited: false, sent: false }));
    } catch (error) {
        console.error("LLM Draft Error:", error);
        return [
            { audience: 'employees', message: `Update regarding your cab: ${routingDecision.suggestedAction}`, edited: false, sent: false },
            { audience: 'client', message: `Incident update: ${parsedData.summary}. Action: ${routingDecision.suggestedAction}`, edited: false, sent: false },
            { audience: 'driver', message: `Action required: ${routingDecision.suggestedAction}`, edited: false, sent: false }
        ];
    }
};