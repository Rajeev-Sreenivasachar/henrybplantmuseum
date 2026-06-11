const chatWindow = document.getElementById('chat-window');
const toggleBtn = document.getElementById('chat-toggle-btn');
const closeBtn = document.getElementById('close-chat-btn');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('museumChatHistory')) || [];

    history.forEach(msg => {
        const div = document.createElement('div');
        div.className = `msg ${msg.sender}`;

// Delete Conversation
        div.textContent = msg.text;

if (msg.sender === 'user') {
    const trash = document.createElement('span');
    trash.className = 'delete-msg';
    trash.innerHTML = '‎<i class="fa-solid fa-trash"></i>';

    trash.addEventListener('click', () => {
        deleteConversation(div);
    });

    div.appendChild(trash);
}

chatMessages.appendChild(div);
    });

    // Scroll to the newest message
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 0);
}

// Pop open or close the chat window
toggleBtn.addEventListener('click', () => {
    chatWindow.classList.toggle('hidden');

    if (!chatWindow.classList.contains('hidden')) {
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 0);
    }
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
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'msg bot';
    loadingDiv.id = `msg-${Date.now()}-loading`;
    loadingDiv.innerText = 'Thinking...';
    chatMessages.appendChild(loadingDiv);

    const loadingId = loadingDiv.id;

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
            const history = JSON.parse(localStorage.getItem('museumChatHistory')) || [];
            history.push({ sender: 'bot', text: data.reply });
            localStorage.setItem('museumChatHistory', JSON.stringify(history));
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
    
    div.id = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// Delete Conversation
    
div.textContent = text;

if (sender === 'user') {
    const trash = document.createElement('span');
    trash.className = 'delete-msg';
    trash.innerHTML = '<i class="fa-solid fa-trash"></i>';

    trash.addEventListener('click', () => {
        deleteConversation(div);
    });

    div.appendChild(trash);
}

chatMessages.appendChild(div);
    
    // Auto-scroll to the bottom so the newest message is always visible
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const history = JSON.parse(localStorage.getItem('museumChatHistory')) || [];
    history.push({ sender, text });
    localStorage.setItem('museumChatHistory', JSON.stringify(history));

    return div.id;
}
loadChatHistory();
