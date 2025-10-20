// Function to get or create a unique session ID for the user
function getSessionId() {
    let sessionId = localStorage.getItem('leanmind-session-id');
    if (!sessionId) {
        // Generate a new unique ID if one doesn't exist
        sessionId = crypto.randomUUID();
        localStorage.setItem('leanmind-session-id', sessionId);
        displayMessage('System', 'New session started. Ask me anything!', 'system');
    }
    return sessionId;
}

// Function to send the message to your Worker API
async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    displayMessage('You', userMessage, 'user');
    chatInput.value = ''; // Clear input immediately
    
    const sessionId = getSessionId();
    // Use the local development URL (http://localhost:8787)
    const apiUrl = 'http://localhost:8787'; 

    try {
        displayMessage('AI', 'Thinking...', 'system'); // Show a loading message

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

        const data = await response.json();
        
        // Remove the 'Thinking...' message
        const thinking = document.getElementById('chat-window').querySelector('.thinking');
        if (thinking) thinking.remove();

        if (response.ok) {
            displayMessage('AI', data.output, 'ai');
        } else {
            // Handle errors from your Worker (e.g., missing input/session ID)
            displayMessage('Error', data.message || `An error occurred: ${response.status}`, 'error');
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        const thinking = document.getElementById('chat-window').querySelector('.thinking');
        if (thinking) thinking.remove();
        displayMessage('System Error', 'Could not connect to the Worker. Is wrangler dev running?', 'error');
    }
}

// Function to append messages to the chat display
function displayMessage(sender, text, type) {
    const chatWindow = document.getElementById('chat-window');
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    
    const senderSpan = document.createElement('span');
    senderSpan.classList.add('sender');
    senderSpan.textContent = sender + ': ';

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    
    messageElement.appendChild(senderSpan);
    messageElement.appendChild(textSpan);
    
    // Add a class for the loading message
    if (text === 'Thinking...') {
        messageElement.classList.add('thinking');
    }

    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll to latest message
}
// Add this to the end of your existing JS file:
document.addEventListener('DOMContentLoaded', () => {
    // Your existing getSessionId() runs here

    // Find the button by its ID and attach the function
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // You can also add an event listener for the 'Enter' key on the input
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevents a new line in the input
                sendMessage();
            }
        });
    }
});

// Initialize the session when the page loads
document.addEventListener('DOMContentLoaded', getSessionId);