document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const res = await fetch('/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    })
  });

  const text = await res.text();
  document.getElementById('message').innerText = text;
});
