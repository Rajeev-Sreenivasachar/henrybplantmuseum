export default async function handler(req, res) {
    // We send a 200 status so the frontend doesn't panic, but we feed the error into 'reply'
    if (req.method !== 'POST') {
        return res.status(200).json({ reply: 'ERROR: Method not allowed.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        // Check 1: Did Vercel actually load the API key?
        if (!apiKey) {
            return res.status(200).json({ reply: 'SYSTEM ERROR: Vercel cannot find GEMINI_API_KEY. Did you redeploy after adding it?' });
        }

        const message = req.body.message;
        const systemPrompt = `You are a helpful virtual assistant. Answer concisely: ${message}`;
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();

        // Check 2: Did Gemini reject our key?
        if (data.error) {
             return res.status(200).json({ reply: 'GEMINI API ERROR: ' + data.error.message });
        }

        // Check 3: Did we get a successful answer?
        if (data.candidates && data.candidates.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: responseText });
        } else {
            return res.status(200).json({ reply: 'UNKNOWN ERROR: ' + JSON.stringify(data) });
        }

    } catch (error) {
        // Check 4: Did the server code physically break?
        return res.status(200).json({ reply: "BACKEND CRASH: " + error.message });
    }
}
