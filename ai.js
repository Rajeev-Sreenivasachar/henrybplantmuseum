document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat-btn');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    if (!chatWindow || !toggleBtn || !closeBtn || !chatMessages || !chatInput || !sendBtn) return;
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
        // 3. Send the message and history to your Vercel backend (/api/chat)
        const history = JSON.parse(localStorage.getItem('museumChatHistory')) || [];
        
        const accessibility = {
            darkMode: document.body.classList.contains('dark-mode'),
            highContrast: document.body.classList.contains('high-contrast'),
            dyslexiaFont: document.body.classList.contains('dyslexia-mode'),
            largeText: document.body.classList.contains('large-text'),
            reducedMotion: document.body.classList.contains('reduced-motion')
        };

        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message, history, accessibility })
        });

        const data = await response.json();
        
        // 4. Replace "Thinking..." with Gemini's actual reply
        const loadingMessageElement = document.getElementById(loadingId);
        if (data.reply) {
            loadingMessageElement.innerText = data.reply;
            const historyList = JSON.parse(localStorage.getItem('museumChatHistory')) || [];
            historyList.push({ sender: 'bot', text: data.reply });
            localStorage.setItem('museumChatHistory', JSON.stringify(historyList));
            
            if (data.redirect) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500); // Wait 1.5 seconds so they can read the reply
            }

            if (data.action) {
                executeChatAction(data.action);
            }
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

function executeChatAction(action) {
    const clickIfFound = (id) => { const el = document.getElementById(id); if (el) el.click(); };
    
    switch (action) {
        case 'toggleDarkMode': clickIfFound('toggle-dark'); break;
        case 'toggleHighContrast': clickIfFound('toggle-contrast'); break;
        case 'toggleDyslexia': clickIfFound('toggle-dyslexia'); break;
        case 'toggleText': clickIfFound('toggle-text'); break;
        case 'toggleReduceMotion': clickIfFound('toggle-motion'); break;
        case 'resetA11y': clickIfFound('reset-a11y-btn'); break;
        case 'openA11y': clickIfFound('btnA11y'); break;
        case 'openResources': clickIfFound('btnResources'); break;
        case 'scrollToTop': window.scrollTo({top: 0, behavior: 'smooth'}); break;
        case 'scrollToBottom': window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'}); break;
        case 'goBack': window.history.back(); break;
        case 'goForward': window.history.forward(); break;
        case 'refreshPage': window.location.reload(); break;
        case 'toggleMenu': clickIfFound('menuToggle'); break;
        case 'hideChat': clickIfFound('close-chat-btn'); break;
        case 'printPage': window.print(); break;
        case 'copyUrl': navigator.clipboard.writeText(window.location.href).then(() => alert('URL Copied!')); break;
        case 'sharePage': 
            if (navigator.share) navigator.share({title: document.title, url: window.location.href}); 
            else alert('Share not supported on this browser.');
            break;
        case 'clearChat': 
            localStorage.removeItem('museumChatHistory'); 
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) chatMessages.innerHTML = '';
            break;
        case 'showLocation': window.open('https://maps.google.com/?q=Henry+B.+Plant+Museum', '_blank'); break;
        case 'showPhone': window.location.href = 'tel:8132541891'; break;
        case 'showEmail': window.location.href = 'mailto:info@plantmuseum.com'; break;
        case 'openNewsletter': window.open('https://henrybplantmuseum.beehiiv.com/', '_blank'); break;
        case 'donate': window.location.href = '/get_involved.html'; break;
        case 'buyTickets': window.location.href = '/visitor.html'; break;
        case 'login': window.location.href = '/profile.html'; break;
        case 'logout': if (typeof window.logout === 'function') window.logout(); break;
        case 'clearItinerary': if (typeof window.clearItinerary === 'function') window.clearItinerary(); break;
        case 'copyItinerary': if (typeof window.copyItinerary === 'function') window.copyItinerary(); break;
        case 'playAudioTour': alert('Simulated: Starting Audio Tour. Please connect your headphones.'); break;
        case 'pauseAudioTour': alert('Simulated: Audio Tour Paused.'); break;
        case 'confetti': triggerConfetti(); break;
        default: console.log('Unknown action:', action);
    }
}

function triggerConfetti() {
    const colors = ['#800020', '#D4AF37', '#ffffff', '#000000'];
    for (let i = 0; i < 80; i++) {
        const conf = document.createElement('div');
        conf.style.position = 'fixed';
        conf.style.width = '10px';
        conf.style.height = '10px';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px';
        conf.style.zIndex = '99999';
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        conf.style.transform = `rotate(${Math.random() * 360}deg)`;
        conf.style.pointerEvents = 'none';
        
        document.body.appendChild(conf);
        
        const animation = conf.animate([
            { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
            { transform: `translate3d(${Math.random()*200 - 100}px, 100vh, 0) rotate(${Math.random()*720}deg)`, opacity: 0 }
        ], {
            duration: Math.random() * 2000 + 2000,
            easing: 'cubic-bezier(.37,0,.63,1)'
        });
        
        animation.onfinish = () => conf.remove();
    }
}

    // Global Keyboard Shortcut: Pressing 'h' opens Henry AI
    document.addEventListener('keydown', (e) => {
        if (e.key === 'h' || e.key === 'H') {
            // Ignore if modifier keys are held down (like Ctrl+H, Alt+H)
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            // Ignore if typing in a text input field, textarea, or content-editable area
            const active = document.activeElement;
            if (active) {
                const tag = active.tagName.toLowerCase();
                if (tag === 'input' || tag === 'textarea' || active.isContentEditable) {
                    return;
                }
            }
            
            // Open the chat window if it is closed
            if (chatWindow.classList.contains('hidden')) {
                chatWindow.classList.remove('hidden');
                setTimeout(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    chatInput.focus();
                }, 50);
            } else {
                // If already open, just focus the input box
                chatInput.focus();
            }
        }
    });

loadChatHistory();
});
