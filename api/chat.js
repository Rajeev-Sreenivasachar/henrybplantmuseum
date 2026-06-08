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

        const safeRead = (filePath) => {
            if (fs.existsSync(filePath)) {
                try {
                    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
                } catch (e) {
                    return { error: "Formatting error in file" };
                }
            }
            return { note: "File not provided." };
        };

        // THE FIX: Hardcoding the exact string paths so Vercel's bundler can see them!
        const artifacts = safeRead(path.join(process.cwd(), 'artifacts.json'));
        const exhibits = safeRead(path.join(process.cwd(), 'exhibits.json'));
        const events = safeRead(path.join(process.cwd(), 'events.json'));
        const main = safeRead(path.join(process.cwd(), 'main.json'));

        const message = req.body.message;
        
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
        return res.status(200).json({ reply: "BACKEND CRASH: " + error.message });
    }
}
