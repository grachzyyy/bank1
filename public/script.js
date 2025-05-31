document.getElementById('login-form').addEventListener('submit', e => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageDiv = document.getElementById('message');

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.text())
    .then(text => {
      if (text === 'admin') {
        window.location.href = 'admin.html';
      } else if (text === 'ok') {
        confetti();
        messageDiv.textContent = 'Добро пожаловать!';
        messageDiv.style.color = 'green';
      } else {
        messageDiv.textContent = text;
        messageDiv.style.color = 'red';
      }
    })
    .catch(err => {
      messageDiv.textContent = 'Ошибка сервера.';
      messageDiv.style.color = 'red';
    });
});
