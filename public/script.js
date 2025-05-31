document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  });

  const messageDiv = document.getElementById('message');

  if (response.ok) {
    const text = await response.text();
    messageDiv.textContent = text;

    if (username === 'admin') {
      window.location.href = '/admin.html';
    } else {
      confetti();
    }
  } else {
    const error = await response.text();
    messageDiv.textContent = error;
  }
});
