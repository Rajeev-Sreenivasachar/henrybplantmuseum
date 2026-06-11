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

        // Wrap the text in a span so it matches appendMessage perfectly
        const textSpan = document.createElement('span');
        textSpan.textContent = msg.text;
        div.appendChild(textSpan);

        if (msg.sender === 'user') {
            const trash = document.createElement('span');
            trash.className = 'delete-msg';
            trash.innerHTML = '<i class="fa-solid fa-trash"></i>';
            trash.addEventListener('click', () => { deleteConversation(div); });
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

    const textSpan = document.createElement('span');
    textSpan.textContent = text;

    div.appendChild(textSpan);

    // only add trash for USER messages
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
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const history = JSON.parse(localStorage.getItem('museumChatHistory')) || [];
    history.push({ sender, text });
    localStorage.setItem('museumChatHistory', JSON.stringify(history));

    return div;
}
// Function to delete the message bubble AND the bot's reply
function deleteConversation(messageDiv) {
    // 1. Grab the text of the user's message before we delete it
    const textSpan = messageDiv.querySelector('span:not(.delete-msg)');
    const messageText = textSpan ? textSpan.textContent : '';

    // 2. Find and remove the bot's reply from the screen (the very next element)
    const botReplyDiv = messageDiv.nextElementSibling;
    if (botReplyDiv && botReplyDiv.classList.contains('bot')) {
        botReplyDiv.remove();
    }

    // 3. Remove the user's message from the screen
    messageDiv.remove();

    // 4. Update localStorage to remove both
    if (messageText) {
        const history = JSON.parse(localStorage.getItem('museumChatHistory')) || [];
        
        // Find exactly where this user message is in the saved history array
        const indexToDelete = history.findIndex(msg => msg.sender === 'user' && msg.text === messageText);

        if (indexToDelete !== -1) {
            // Check if the message immediately after it is from the bot
            let itemsToDelete = 1; 
            if (indexToDelete + 1 < history.length && history[indexToDelete + 1].sender === 'bot') {
                itemsToDelete = 2; // Delete BOTH the user message and the bot reply
            }
            
            // Slice them out of the history array and save the updated version
            history.splice(indexToDelete, itemsToDelete);
            localStorage.setItem('museumChatHistory', JSON.stringify(history));
        }
    }
}
loadChatHistory();
