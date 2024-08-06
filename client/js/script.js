const apiUrl = 'http://127.0.0.1:8080';
const content = document.getElementById('content');

function setContent(html) {
    content.innerHTML = html;
}

function showLoginPage() {
    setContent(`
        <div class="container">
            <h2>Login</h2>
            <form id="loginForm">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#" id="goToRegister">Register here</a></p>
        </div>
    `);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('goToRegister').addEventListener('click', showRegisterPage);
}

function showRegisterPage() {
    setContent(`
        <div class="container">
            <h2>Register</h2>
            <form id="registerForm">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required>
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Register</button>
            </form>
            <p>Already have an account? <a href="#" id="goToLogin">Login here</a></p>
        </div>
    `);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('goToLogin').addEventListener('click', showLoginPage);
}

async function handleLogin(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        const response = await fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showHomePage();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during login:', error);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
        const response = await fetch(`${apiUrl}/regin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            showHomePage();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
}

function showHomePage() {
    setContent(`
        <div class="container">
            <h2>Welcome</h2>
            <p>You are logged in!</p>
            <button id="logout">Logout</button>
        </div>
    `);
    document.getElementById('logout').addEventListener('click', handleLogout);
}

function handleLogout() {
    localStorage.removeItem('token');
    showLoginPage();
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        showHomePage();
    } else {
        showLoginPage();
    }
});
