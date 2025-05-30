document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const messageBox = document.getElementById('message');

  // Очистить сообщение
  messageBox.textContent = '';
  messageBox.style.color = 'black';

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.text();

    if (response.ok) {
      messageBox.style.color = 'green';
      messageBox.textContent = result;
      launchConfetti();
    } else {
      messageBox.style.color = 'red';
      messageBox.textContent = result;
    }
  } catch (error) {
    messageBox.style.color = 'red';
    messageBox.textContent = 'Ошибка подключения к серверу.';
    console.error(error);
  }
});

function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
