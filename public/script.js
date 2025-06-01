document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const msg = await res.text();

  let msgEl = document.getElementById('message');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.id = 'message';
    msgEl.style.marginTop = '12px';
    msgEl.style.fontWeight = '500';
    msgEl.style.color = '#EF4444';
    document.querySelector('.login-form').appendChild(msgEl);
  }

  if (msg === 'ok') {
    msgEl.textContent = 'Добро пожаловать!';
    msgEl.style.color = '#0E9F6E';
    confetti();
  } else if (msg === 'admin') {
    window.location.href = '/admin.html';
  } else {
    msgEl.textContent = msg;
    msgEl.style.color = '#EF4444';
  }
});
