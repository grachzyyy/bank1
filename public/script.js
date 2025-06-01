const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = form.username.value;
  const password = form.password.value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();
    alert(text);

    if (res.ok && (text.includes('Добро пожаловать') || text === 'admin')) {
      // Конфетти только при успешном входе
      confetti();
      if (text === 'admin') window.location.href = 'admin.html';
    }

  } catch (err) {
    alert('Ошибка подключения к серверу.');
  }
});
