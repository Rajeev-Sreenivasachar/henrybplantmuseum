const fs = require('fs');
const path = require('path');

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
        const history = req.body.history || [];
        
        const systemPrompt = `
        You are a helpful virtual assistant and guide for our new museum website. 
        
        1. If the user asks about the museum, exhibits, artifacts, or events, use ONLY this data to answer:
        Main Info: ${JSON.stringify(main)}
        Artifacts: ${JSON.stringify(artifacts)}
        Exhibits: ${JSON.stringify(exhibits)}
        Events: ${JSON.stringify(events)}

        2. If the user asks a general question unrelated to the museum, go ahead and answer it normally using your general knowledge. Keep all answers concise and helpful.
        
        3. ALWAYS output a valid JSON object in the following format:
        {
          "reply": "Your response to the user",
          "redirect": "/target-page.html" // ONLY include this key if the user explicitly asks to be taken/redirected to a specific page (e.g., /about.html, /events.html, /exhibits.html, /artifacts.html, /profile.html, /get_involved.html). If no redirection is requested, omit the "redirect" key or set it to null.
        }`;

        const contents = [];
        for (const msg of history) {
            contents.push({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            });
        }
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });
        
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: contents,
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const data = await response.json();

        if (data.error) {
             return res.status(200).json({ reply: 'GEMINI API ERROR: ' + data.error.message });
        }

        if (data.candidates && data.candidates.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text;
            let parsed;
            try {
                parsed = JSON.parse(responseText);
            } catch (e) {
                return res.status(200).json({ reply: responseText });
            }
            return res.status(200).json({ reply: parsed.reply || "No reply generated", redirect: parsed.redirect || null });
        } else {
            return res.status(200).json({ reply: 'UNKNOWN ERROR: ' + JSON.stringify(data) });
        }

    } catch (error) {
        return res.status(200).json({ reply: "BACKEND CRASH: " + error.message });
    }
}
