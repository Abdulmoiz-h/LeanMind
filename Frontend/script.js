// Function to get or create a unique session ID for the user
function getSessionId() {
    let sessionId = localStorage.getItem('leanmind-session-id');
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('leanmind-session-id', sessionId);
        displayMessage('System', 'Welcome to LeanMind! I\'m your AI coach for fitness, focus, and self-improvement. How can I help you today?', 'system');
        updateSessionDisplay(sessionId);
    }
    return sessionId;
}

// Update session display in menu
function updateSessionDisplay(sessionId) {
    const display = document.getElementById('session-display');
    if (display) {
        display.textContent = sessionId.substring(0, 8) + '...';
    }
}

// Function to format AI response with proper formatting
function formatAIMessage(text) {
    // Convert markdown-like formatting to HTML
    let formattedText = text
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists - basic support
        .replace(/^- (.*?)(?=\n|$)/gm, '• $1\n')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Multiple line breaks become paragraphs
        .replace(/(<br>){2,}/g, '</p><p>');
    
    // Wrap in paragraph tags if there are multiple lines
    if (formattedText.includes('</p>')) {
        formattedText = '<p>' + formattedText + '</p>';
    }
    
    return formattedText;
}

// Function to send the message to your Worker API
async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    // Fade out system messages
    fadeOutSystemMessages();

    displayMessage('You', userMessage, 'user');
    chatInput.value = '';
    
    const sessionId = getSessionId();
    const apiUrl = 'http://localhost:8787';

    try {
        displayMessage('AI', 'Thinking...', 'system thinking');

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: userMessage,
                sessionId: sessionId
            })
        });

        // Remove thinking message
        removeThinkingMessage();

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.output) {
            displayMessage('AI', data.output, 'ai');
        } else {
            throw new Error('No output in response');
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        removeThinkingMessage();
        displayMessage('System Error', `Could not connect to the Worker: ${error.message}`, 'error');
    }
}

// Function to fade out system messages
function fadeOutSystemMessages() {
    const systemMessages = document.querySelectorAll('.message.system:not(.thinking)');
    systemMessages.forEach(message => {
        message.classList.add('fade-out');
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 500);
    });
}

// Function to remove the thinking message
function removeThinkingMessage() {
    const thinkingElements = document.querySelectorAll('.thinking');
    thinkingElements.forEach(element => {
        element.remove();
    });
}

// Function to append messages to the chat display
function displayMessage(sender, text, type) {
    const chatWindow = document.getElementById('chat-window');
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    // Handle multiple classes
    if (type.includes(' ')) {
        type.split(' ').forEach(cls => messageElement.classList.add(cls));
    } else {
        messageElement.classList.add(type);
    }
    
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('sender');
    senderSpan.textContent = sender + ':';

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Format AI messages with HTML
    if (type === 'ai') {
        contentDiv.innerHTML = formatAIMessage(text);
    } else {
        contentDiv.textContent = text;
    }
    
    messageElement.appendChild(senderSpan);
    messageElement.appendChild(contentDiv);

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Menu functions
function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.overlay');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// Modal functions
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = content;
    modal.style.display = 'block';
    closeMenu(); // Close sidebar when modal opens
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Menu content templates
const menuContent = {
    about: `
        <h2>About LeanMind</h2>
        <p>LeanMind is your personal AI coach dedicated to helping you achieve your fitness goals, improve focus, and build better habits.</p>
        <div style="margin-top: 20px;">
            <h3>Features:</h3>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Personalized fitness guidance</li>
                <li>Focus and productivity tips</li>
                <li>Habit formation strategies</li>
                <li>Secure and private conversations</li>
            </ul>
        </div>
    `,
    ai: `
        <h2>AI Features</h2>
        <p>Powered by advanced AI technology, LeanMind provides:</p>
        <div style="margin-top: 20px;">
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0;">
                <h4><i class="fas fa-dumbbell"></i> Fitness Coaching</h4>
                <p>Get personalized workout plans and nutrition advice.</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0;">
                <h4><i class="fas fa-brain"></i> Focus Training</h4>
                <p>Learn techniques to improve concentration and productivity.</p>
            </div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin: 10px 0;">
                <h4><i class="fas fa-chart-line"></i> Habit Building</h4>
                <p>Develop lasting habits with science-backed strategies.</p>
            </div>
        </div>
    `,
    fitness: `
        <h2>Fitness Coaching</h2>
        <p>Get personalized fitness guidance tailored to your goals.</p>
        <div style="margin-top: 20px;">
            <p>Ask me about:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Workout routines</li>
                <li>Nutrition plans</li>
                <li>Recovery strategies</li>
                <li>Goal setting</li>
                <li>Progress tracking</li>
            </ul>
        </div>
    `,
    focus: `
        <h2>Focus & Productivity</h2>
        <p>Enhance your concentration and get more done.</p>
        <div style="margin-top: 20px;">
            <p>Ask me about:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Pomodoro technique</li>
                <li>Mindfulness exercises</li>
                <li>Time management</li>
                <li>Distraction elimination</li>
                <li>Deep work strategies</li>
            </ul>
        </div>
    `,
    habits: `
        <h2>Habit Formation</h2>
        <p>Build lasting habits that stick.</p>
        <div style="margin-top: 20px;">
            <p>Ask me about:</p>
            <ul style="margin-left: 20px; margin-top: 10px;">
                <li>Habit stacking</li>
                <li>Atomic habits</li>
                <li>Consistency strategies</li>
                <li>Motivation techniques</li>
                <li>Progress tracking</li>
            </ul>
        </div>
    `
};

// Clear chat function
function clearChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    displayMessage('System', 'Chat cleared. How can I help you?', 'system');
}

// New session function
function newSession() {
    localStorage.removeItem('leanmind-session-id');
    const chatWindow = document.getElementById('chat-window');
    chatWindow.innerHTML = '';
    getSessionId(); // This will create a new session and display welcome message
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize session
    const sessionId = getSessionId();
    updateSessionDisplay(sessionId);

    // Set up event listeners
    const menuToggleBtn = document.getElementById('menu-toggle');
    const closeMenuBtn = document.getElementById('close-menu');
    const sendButton = document.getElementById('send-button');
    const chatInput = document.getElementById('chat-input');
    const clearButton = document.getElementById('clear-chat');
    const newSessionButton = document.getElementById('new-session');
    const closeModalBtn = document.querySelector('.close-modal');
    const modal = document.getElementById('modal');
    const overlay = document.querySelector('.overlay');

    // Menu toggle
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMenu);
    }

    // Close menu button
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', closeMenu);
    }

    // Send message
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Enter key for sending
    if (chatInput) {
        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
        chatInput.focus();
    }

    // Clear chat
    if (clearButton) {
        clearButton.addEventListener('click', clearChat);
    }

    // New session
    if (newSessionButton) {
        newSessionButton.addEventListener('click', newSession);
    }

    // Menu item click handlers
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            if (menuContent[section]) {
                showModal(menuContent[section]);
            }
        });
    });

    // Modal close handlers
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Overlay click to close menu
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }

    // Close menu when clicking outside on mobile
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menu-toggle');
        
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle && 
            !menuToggle.contains(e.target)) {
            closeMenu();
        }
    });

    // Add some sample suggestions on first visit
    const isFirstVisit = !localStorage.getItem('leanmind-visited');
    if (isFirstVisit) {
        setTimeout(() => {
            displayMessage('System', 'Try asking: "What\'s a good morning routine for productivity?" or "How can I start a workout plan?"', 'system');
        }, 2000);
        localStorage.setItem('leanmind-visited', 'true');
    }
});