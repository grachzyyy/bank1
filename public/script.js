const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const confetti = new Confetti();

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();

    if (res.ok) {
      showMessage(text, true);
      confetti.start();
    } else {
      showMessage(text, false);
    }

  } catch (err) {
    showMessage('Ошибка соединения с сервером.', false);
  }
});

function showMessage(text, success) {
  message.className = 'message ' + (success ? 'success' : 'error');
  message.textContent = text;
  message.style.display = 'block';
}
