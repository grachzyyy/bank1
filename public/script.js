document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('message').textContent = 'Вход успешен!';
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

      setTimeout(() => {
        if (data.admin) {
          window.location.href = 'admin.html';
        }
      }, 1000);
    } else {
      document.getElementById('message').textContent = data;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Ошибка подключения к серверу';
  }
});
