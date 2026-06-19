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
        
        const a11y = req.body.accessibility || {};
        const systemPrompt = `
        Your name is Henry. You are a helpful virtual assistant and guide for our new museum website. 
        
        The user's current accessibility settings are:
        - Dark Mode: ${a11y.darkMode ? 'ON' : 'OFF'}
        - High Contrast: ${a11y.highContrast ? 'ON' : 'OFF'}
        - Dyslexia Font: ${a11y.dyslexiaFont ? 'ON' : 'OFF'}
        - Large Text: ${a11y.largeText ? 'ON' : 'OFF'}
        - Reduced Motion: ${a11y.reducedMotion ? 'ON' : 'OFF'}

        1. If the user asks about the museum, exhibits, artifacts, or events, use ONLY this data to answer:
        Main Info: ${JSON.stringify(main)}
        Artifacts: ${JSON.stringify(artifacts)}
        Exhibits: ${JSON.stringify(exhibits)}
        Events: ${JSON.stringify(events)}

        2. If the user asks a general question unrelated to the museum, go ahead and answer it normally using your general knowledge. Keep all answers concise and helpful.
        
        3. ALWAYS output a valid JSON object in the following format:
        {
          "reply": "Your response to the user",
          "redirect": "/target-page.html", // ONLY include if the user explicitly asks to be taken/redirected to a specific page. Otherwise null.
          "action": "ACTION_NAME" // ONLY include if the user asks you to perform one of the allowed actions. Otherwise null.
        }

        4. ALLOWED ACTION_NAME VALUES AND DESCRIPTION:
        - "toggleDarkMode": Use when the user requests turning on/off or toggling Dark Mode.
        - "toggleHighContrast": Use when the user requests turning on/off or toggling High Contrast Mode.
        - "toggleDyslexia": Use when the user requests turning on/off or toggling Dyslexia Font.
        - "toggleText": Use when the user requests turning on/off or toggling Large Text.
        - "toggleReduceMotion": Use when the user requests turning on/off, toggling, or setting "Reduce Motion" (reducing animations/motion on the site).
        - "resetA11y": Use when the user requests turning off ALL accessibility features, resetting all accessibility settings/options to default, or disabling all active styling features.
        - "openA11y": Use when the user requests opening/showing the accessibility settings panel/drawer.
        - "openResources": Use when the user requests opening/showing the resources panel/drawer.
        - "scrollToTop": Use when the user requests scrolling to the top of the page.
        - "scrollToBottom": Use when the user requests scrolling to the bottom of the page.
        - "goBack": Use when the user requests going back to the previous page.
        - "goForward": Use when the user requests going forward in history.
        - "refreshPage": Use when the user requests refreshing/reloading the page.
        - "toggleMenu": Use when the user requests opening/closing or toggling the navigation menu.
        - "hideChat": Use when the user requests closing or hiding the chat box.
        - "printPage": Use when the user requests printing the page.
        - "copyUrl": Use when the user requests copying the page link/URL.
        - "sharePage": Use when the user requests sharing the page.
        - "clearChat": Use when the user requests clearing/resetting the chat history.
        - "showLocation": Use when the user requests the location or directions to the museum.
        - "showPhone": Use when the user requests the phone number or calling the museum.
        - "showEmail": Use when the user requests the email address or emailing the museum.
        - "openNewsletter": Use when the user requests signing up/opening the newsletter.
        - "donate": Use when the user requests donating or helping the museum.
        - "buyTickets": Use when the user requests buying tickets or admission.
        - "login": Use when the user requests logging in, signing up, or viewing their profile.
        - "logout": Use when the user requests logging out.
        - "clearItinerary": Use when the user requests clearing their itinerary.
        - "copyItinerary": Use when the user requests copying their itinerary.
        - "playAudioTour": Use when the user requests playing the audio tour.
        - "pauseAudioTour": Use when the user requests pausing the audio tour.
        - "confetti": Use when the user requests confetti or celebrating.

        If the user intent matches one of those commands, set the "action" key to the exact string value.
        `;

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
            return res.status(200).json({ 
                reply: parsed.reply || "No reply generated", 
                redirect: parsed.redirect || null,
                action: parsed.action || null
            });
        } else {
            return res.status(200).json({ reply: 'UNKNOWN ERROR: ' + JSON.stringify(data) });
        }

    } catch (error) {
        return res.status(200).json({ reply: "BACKEND CRASH: " + error.message });
    }
}
