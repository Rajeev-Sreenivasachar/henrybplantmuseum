const chatWindow = document.getElementById('chat-window');
const toggleBtn = document.getElementById('chat-toggle-btn');
const closeBtn = document.getElementById('close-chat-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Pop open or close the chat window
toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');
});

closeBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
});

// The main function that handles chatting
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return; // Don't send empty messages

    // 1. Put the user's message on the screen
    appendMessage('user', message);
    chatInput.value = ''; // Clear the input box

    // 2. Put a temporary "Thinking..." message for the bot
    const loadingId = appendMessage('bot', 'Thinking...');

    try {
        // 3. Send the message to your Vercel backend (/api/chat)
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        // 4. Replace "Thinking..." with Gemini's actual reply
        const loadingMessageElement = document.getElementById(loadingId);
        if (data.reply) {
            loadingMessageElement.innerText = data.reply;
        } else {
            loadingMessageElement.innerText = "Error: Couldn't generate a response.";
        }
    } catch (error) {
        document.getElementById(loadingId).innerText = "Connection error. Please try again.";
    }
}

// Send when clicking the button
sendBtn.addEventListener('click', sendMessage);

// Send when pressing the "Enter" key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// A quick helper function to draw the chat bubbles on screen
function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = `msg ${sender}`;
    
    // THE FIX: Added Math.random() so the User and Bot bubbles NEVER share the same ID
    div.id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; 
    
    div.innerText = text;
    chatMessages.appendChild(div);
    
    // Auto-scroll to the bottom so the newest message is always visible
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return div.id;
}
