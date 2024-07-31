const wsUrl = 'ws://localhost:8080/ws'; // URL вашего WebSocket сервера
const apiUrl = 'http://127.0.0.1:8080'; // URL вашего HTTP сервера
let ws;
let username;
let authToken;

// Обработка загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    ws = new WebSocket(wsUrl);
    ws.onopen = () => console.log('Connected to WebSocket');
    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        displayMessage(msg);
    };
    ws.onerror = (error) => console.error('WebSocket Error: ', error);
    ws.onclose = () => console.log('WebSocket connection closed');
});

function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'none';
}

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
    document.getElementById('chatSection').style.display = 'none';
}

function showChat() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'block';
}

function login() {
    const usernameInput = document.getElementById('loginUsername').value;
    const passwordInput = document.getElementById('loginPassword').value;
    
    fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
    }).then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login failed');
        }
    }).then(data => {
        authToken = data.token; // Сохранение токена
        username = usernameInput;
        showChat();
    }).catch(error => {
        console.error('Error:', error);
        alert('Login failed');
    });
}

function register() {
    const usernameInput = document.getElementById('registerUsername').value;
    const passwordInput = document.getElementById('registerPassword').value;

    fetch(`${apiUrl}/regin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
    }).then(response => {
        if (response.ok) {
            alert('Registration successful');
            showLogin();
        } else {
            throw new Error('Registration failed');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('Registration failed');
    });
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput').value;
    if (messageInput.trim() === '') return;

    const message = {
        sender: username,
        recipient: 'user2', // Adjust recipient as needed
        text: messageInput,
        timestamp: new Date().toISOString()
    };

    ws.send(JSON.stringify(message));
    document.getElementById('messageInput').value = '';
}

function displayMessage(msg) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<p><strong>${msg.sender}</strong>: ${msg.text} <small>${msg.timestamp}</small></p>`;
    document.getElementById('messages').appendChild(messageElement);
    document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

function logout() {
    username = null;
    authToken = null;
    ws.close();
    showLogin();
}
