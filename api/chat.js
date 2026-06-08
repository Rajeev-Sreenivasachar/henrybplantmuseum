export default async function handler(req, res) {
    // 1. Check if it's the right type of request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const message = req.body.message;

        // 2. A super simple prompt without the JSON data
        const systemPrompt = `You are a helpful virtual assistant. Answer the user's question concisely: ${message}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        // 3. Call Gemini
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

        // 4. Send the response back to your website
        if (data.candidates && data.candidates.length > 0) {
            const responseText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ reply: responseText });
        } else {
            return res.status(500).json({ error: 'API Key might be wrong or Gemini rejected the request.' });
        }

    } catch (error) {
        // This will now successfully send the exact crash reason back to your chat UI
        return res.status(500).json({ error: "Backend error: " + error.message });
    }
}
