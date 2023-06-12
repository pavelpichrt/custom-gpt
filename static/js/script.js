// const API_URL = 'https://voxwebapp.azurewebsites.net';
const API_URL = 'http://localhost';

document.getElementById('user-input').addEventListener('keydown', event => {
  // When a shift is pressed, only add a new line.
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

authenticate();

// Load user messages from local storage
let messages = JSON.parse(localStorage.getItem('messages')) || [];

// Display loaded messages
const chatContainer = document.getElementById('chat-container');
messages
  .slice()
  .map(msg => {
    msg.content = formatMessage(msg.content);

    return msg;
  })
  .forEach(message => {
    const bubble = document.createElement('div');
    bubble.className = `bubble ${message.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`;
    bubble.innerHTML = message.content;
    chatContainer.prepend(bubble);
  });

async function authenticate() {
  let token = localStorage.getItem('SECRET_TOKEN');
  let data;

  // Prompt the user for the SECRET_TOKEN if it's not in local storage
  if (!localStorage.getItem('SECRET_TOKEN')) {
    token = prompt('Please enter your secret token:', '');
    if (!token) {
      alert('You need to enter your secret token. Refresh the page to retry.');
      return;
    }
  }

  try {
    const response = await fetch(`${API_URL}/check-token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    data = await response.json();

    const isValidToken = data.response;

    if (isValidToken) {
      document.querySelector('.content-container').style.display = 'flex';
      localStorage.setItem('SECRET_TOKEN', token);
    } else {
      localStorage.removeItem('SECRET_TOKEN');
      await authenticate();
    }
  } catch (err) {
    alert(err);
  }
}

function formatMessage(msg) {
  return msg.replace(/```([\s\S]*?)```/gs, (match, innerText) => {
    const formattedText = innerText.replace(/\n/g, '<br/>').replace(/ /g, '&nbsp;');
    return `<blockquote>${formattedText}</blockquote>`;
  });
}

async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const spinnerEl = document.querySelector('.spinner-container');
  const SECRET_TOKEN = localStorage.getItem('SECRET_TOKEN');
  console.log(userInput.value);
  const prompt = formatMessage(userInput.value);

  userInput.value = '';
  spinnerEl.style.display = 'block';

  // Save and display user's message
  const userBubble = document.createElement('div');
  const userMessage = { role: 'user', content: prompt };
  messages.push(userMessage);
  userBubble.className = 'bubble user-bubble';
  userBubble.textContent = prompt;
  chatContainer.prepend(userBubble);

  try {
    // Call the API
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SECRET_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, ...messages],
      }),
    });
    const data = await response.json();

    // The API returns 200 even when it errors...
    if (data.error) {
      throw new Error(data.error);
    }

    // Save and display ChatGPT's response
    const assistantMessage = { role: 'assistant', content: data.response };
    messages.push(assistantMessage);
    const assistantBubble = document.createElement('div');
    assistantBubble.className = 'bubble assistant-bubble';
    assistantBubble.innerHTML = formatMessage(data.response);
    chatContainer.prepend(assistantBubble);

    // Save messages to local storage
    localStorage.setItem('messages', JSON.stringify(messages));
  } catch (error) {
    showErrorModal('Error communicating with the API.');
  }

  spinnerEl.style.display = 'none';
}

function showErrorModal(message) {
  const errorModal = document.getElementById('error-modal');
  const errorText = document.getElementById('error-text');

  errorText.textContent = message;
  errorModal.style.display = 'block';

  setTimeout(() => {
    errorModal.style.display = 'none';
  }, 10000);
}

function closeModal() {
  const errorModal = document.getElementById('error-modal');
  errorModal.style.display = 'none';
}
