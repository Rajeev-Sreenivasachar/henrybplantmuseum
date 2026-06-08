// By directly requiring the JSON files, Vercel automatically includes them in your build.
// This completely bypasses the need for the 'fs' module.
const artifacts = require('../data/artifacts.json');
const exhibits = require('../data/exhibits.json');
const events = require('../data/events.json');
const main = require('../data/main.json');

module.exports = async function handler(req, res) {
    // Block direct browser visits (which are GET requests)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use the chat interface.' });
    }

    const { message } = req.body;
    
    // Pulls your key safely from Vercel's Environment Variables
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        const systemPrompt = `
        You are a helpful virtual assistant and guide for our new museum website. 
        
        1. If the user asks about the museum, exhibits, artifacts, or events, use ONLY this data to answer:
        Main Info: ${JSON.stringify(main)}
        Artifacts: ${JSON.stringify(artifacts)}
        Exhibits: ${JSON.stringify(exhibits)}
        Events: ${JSON.stringify(events)}

        2. If the user asks a math question, a coding question, or a general knowledge question unrelated to the museum, go ahead and answer it normally using your general knowledge. Keep all answers concise and helpful.
        
        User Question: ${message}`;

        // Directly call the Gemini REST API
        const geminiUrl = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=\${apiKey}\`;
        
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt }]
                }]
            })
        });

        const data = await response.json();

        // Safety check to ensure we got a valid response back
        if (!data.candidates || data.candidates.length === 0) {
            console.error("API Error:", data);
            return res.status(500).json({ error: 'Invalid response from Gemini API' });
        }

        // Extract the text from Gemini's JSON structure
        const responseText = data.candidates[0].content.parts[0].text;

        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Failed to fetch response' });
    }
}
