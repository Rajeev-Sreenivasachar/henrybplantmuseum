import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(200).json({ reply: 'ERROR: Method not allowed.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(200).json({ reply: 'SYSTEM ERROR: Vercel cannot find GEMINI_API_KEY.' });
        }

        // Safely load the 4 JSON files
        const loadJson = (filename) => {
            const filePath = path.join(process.cwd(), 'data', filename);
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        };

        const artifacts = loadJson('artifacts.json');
        const exhibits = loadJson('exhibits.json');
        const events = loadJson('events.json');
        const main = loadJson('main.json');

        const message = req.body.message;
        
        // The Museum Guide Instructions
        const systemPrompt = `
        You are a helpful virtual assistant and guide for our new museum website. 
        
        1. If the user asks about the museum, exhibits, artifacts, or events, use ONLY this data to answer:
        Main Info: ${JSON.stringify(main)}
        Artifacts: ${JSON.stringify(artifacts)}
        Exhibits: ${JSON.stringify(exhibits)}
        Events: ${JSON.stringify(events)}

        2. If the user asks a general question unrelated to the museum, go ahead and answer it normally using your general knowledge. Keep all answers concise and helpful.
        
        User Question: ${message}`;
        
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
             return res.status(200).json({ reply: 'GEMINI API ERROR: ' + data.error.message });
        }

        if (data.candidates && data.candidates.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: responseText });
        } else {
            return res.status(200).json({ reply: 'UNKNOWN ERROR: ' + JSON.stringify(data) });
        }

    } catch (error) {
        // If Vercel complains about your JSON files, it will tell you exactly why right in the chat window!
        return res.status(200).json({ reply: "BACKEND CRASH: " + error.message });
    }
}
