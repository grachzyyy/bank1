document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const msg = await res.text();
  const msgEl = document.getElementById('message');

  if (msg === 'ok') {
    msgEl.textContent = 'Добро пожаловать!';
    confetti();
  } else if (msg === 'admin') {
    window.location.href = '/admin.html';
  } else {
    msgEl.textContent = msg;
  }
});
