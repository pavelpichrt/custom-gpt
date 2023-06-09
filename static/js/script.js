document.getElementById("user-input").addEventListener("keyup", function(event) {
  if (event.key === "Enter") {
      sendMessage();
  }
});

// Prompt the user for the SECRET_TOKEN if it's not in local storage
if (!localStorage.getItem('SECRET_TOKEN')) {
  let token = prompt("Please enter your secret token:", "");
  localStorage.setItem('SECRET_TOKEN', token);
}

// Load user messages from local storage
let messages = JSON.parse(localStorage.getItem('messages')) || [];

// Display loaded messages
const chatContainer = document.getElementById("chat-container");
messages.slice().reverse().forEach(message => {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${message.role === "user" ? "user-bubble" : "assistant-bubble"}`;
  bubble.textContent = message.content;
  chatContainer.prepend(bubble);
});

async function sendMessage() {
  const userInput = document.getElementById("user-input");
  const SECRET_TOKEN = localStorage.getItem('SECRET_TOKEN');
  
  // Save and display user's message
  const userMessage = {role: "user", content: userInput.value};
  messages.push(userMessage);
  const userBubble = document.createElement("div");
  userBubble.className = "bubble user-bubble";
  userBubble.textContent = userInput.value;
  chatContainer.prepend(userBubble);

  try {
      // Call the API
      const response = await fetch('http://localhost/chat', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${SECRET_TOKEN}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              messages: [{role: "system", content: "You are a helpful assistant."}, ...messages]
          })
      });
      const data = await response.json();
      
      // Save and display ChatGPT's response
      const assistantMessage = {role: "assistant", content: data.response};
      messages.push(assistantMessage);
      const assistantBubble = document.createElement("div");
      assistantBubble.className = "bubble assistant-bubble";
      assistantBubble.textContent = data.response;
      chatContainer.prepend(assistantBubble);
      
      // Save messages to local storage
      localStorage.setItem('messages', JSON.stringify(messages));
  } catch (error) {
      showErrorModal('Error communicating with the API.');
  }

  userInput.value = '';
}

function showErrorModal(message) {
  const errorModal = document.getElementById("error-modal");
  const errorText = document.getElementById("error-text");
  
  errorText.textContent = message;
  errorModal.style.display = "block";
  
  setTimeout(() => {
      errorModal.style.display = "none";
  }, 10000);
}

function closeModal() {
  const errorModal = document.getElementById("error-modal");
  errorModal.style.display = "none";
}