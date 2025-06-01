// public/script.js — исправленный код
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.querySelector('#username').value;
  const password = document.querySelector('#password').value;
  const message = document.querySelector('#message');

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();
    message.textContent = text;

    if (res.ok) {
      if (text === 'admin') {
        window.location.href = 'admin.html';
      } else {
        // Показываем конфетти только при УСПЕШНОМ пользовательском входе
        import('https://cdn.skypack.dev/canvas-confetti').then(({ default: confetti }) => {
          confetti();
        });
      }
    }
  } catch (err) {
    message.textContent = 'Ошибка при входе';
  }
});
