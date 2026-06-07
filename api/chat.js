import https from 'https';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY on server.' });
  }

  const { conversationHistory, systemInstruction } = req.body;

  // Format the payload exactly how Google's direct API expects it
  const postData = JSON.stringify({
    contents: conversationHistory,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    }
  });
 const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        return res.status(200).json(parsedData);
      } catch (e) {
        return res.status(500).json({ error: 'Failed to parse AI response' });
      }
    });
  });

  request.on('error', (error) => {
    return res.status(500).json({ error: error.message });
  });

  request.write(postData);
  request.end();
}
}