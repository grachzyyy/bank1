document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

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

    if (text === 'admin') {
      window.location.href = '/admin.html';
    } else {
      message.innerText = text;

      // Показываем конфетти ТОЛЬКО при успешном входе обычного пользователя
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  } else {
    const error = await res.text();
    message.innerText = error;
  }
});
