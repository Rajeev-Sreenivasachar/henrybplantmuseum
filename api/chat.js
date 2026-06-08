import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message } = req.body;
    
    // Vercel automatically loads this from your environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    try {
        // Helper to load your 4 JSON files
        const loadJson = (filename) => {
            const filePath = path.join(process.cwd(), 'data', filename);
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        };

        const artifacts = loadJson('artifacts.json');
        const exhibits = loadJson('exhibits.json');
        const events = loadJson('events.json');
        const main = loadJson('main.json');

        // Bundle the instructions with your JSON data
        const systemPrompt = `
        You are a helpful and knowledgeable guide for a museum website. Use ONLY the following JSON data to answer the user's question. 
        If the answer isn't in the data, politely say you don't have that information. Keep answers concise.
        
        Main Info: ${JSON.stringify(main)}
        Artifacts: ${JSON.stringify(artifacts)}
        Exhibits: ${JSON.stringify(exhibits)}
        Events: ${JSON.stringify(events)}
        
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
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch response' });
    }
}
