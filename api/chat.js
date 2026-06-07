export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { conversationHistory, systemInstruction } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY; 

  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured on server.' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemInstruction, 
        contents: conversationHistory,
        generationConfig: {
          temperature: 0.5
        }
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Backend Route Error:", error);
    return res.status(500).json({ error: 'Internal server error processing chat.' });
  }
}
