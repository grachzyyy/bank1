function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  fetch('/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username, password })
  })
    .then(res => res.text())
    .then(text => {
      if (text === 'admin') {
        window.location.href = '/admin.html';
      } else {
        document.getElementById('message').innerText = text;
        confetti();
      }
    })
    .catch(err => document.getElementById('message').innerText = 'Ошибка: ' + err.message);
}
