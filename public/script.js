async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const message = document.getElementById('message');

  if (res.ok) {
    const text = await res.text();
    message.textContent = text;

    if (text === 'admin') {
      window.location.href = 'admin.html';
    } else {
      confetti(); // запускается ТОЛЬКО при успешном входе
    }
  } else {
    const error = await res.text();
    message.textContent = error;
  }
}
