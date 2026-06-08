module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // By moving these inside the try/catch, we prevent a hard crash
        // and force Vercel to tell us EXACTLY what went wrong.
        const artifacts = require('../data/artifacts.json');
        const exhibits = require('../data/exhibits.json');
        const events = require('../data/events.json');
        const main = require('../data/main.json');

        const systemPrompt = `
        You are a helpful virtual assistant and guide for our new museum website. 
        
        1. If the user asks about the museum, exhibits, artifacts, or events, use ONLY this data to answer:
        Main Info: ${JSON.stringify(main)}
        Artifacts: ${JSON.stringify(artifacts)}
        Exhibits: ${JSON.stringify(exhibits)}
        Events: ${JSON.stringify(events)}

        2. If the user asks a math question, a coding question, or a general knowledge question unrelated to the museum, go ahead and answer it normally using your general knowledge. Keep all answers concise and helpful.
        
        User Question: ${message}`;

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

        if (!data.candidates || data.candidates.length === 0) {
            console.error("API Error:", data);
            return res.status(500).json({ error: 'Gemini API rejected the request. Check your API key.' });
        }

        const responseText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ reply: responseText });

    } catch (error) {
        // If it crashes now, it will spit the exact error to your Vercel logs AND your chat window
        console.error("Server Crash Details:", error.message);
        res.status(500).json({ error: "Backend error: " + error.message });
    }
}
