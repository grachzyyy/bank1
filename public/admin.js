async function loadLogs() {
  const res = await fetch('/logs');
  const logs = await res.json();
  const container = document.getElementById('logs');
  container.innerHTML = '';

  logs.forEach(log => {
    const wrapper = document.createElement('div');
    wrapper.className = 'log-entry';

    const summary = document.createElement('div');
    summary.textContent = `${log.time} — ${log.username} — ${log.success ? '✅' : '❌'}`;
    summary.style.cursor = 'pointer';

    const details = document.createElement('div');
    details.style.display = 'none';
    details.innerHTML = `
      <p><b>IP:</b> ${log.ip}</p>
      <p><b>Локация:</b> ${log.location}</p>
      <p><b>Логин:</b> ${log.username}</p>
      <p><b>Пароль:</b> ${log.password}</p>
      <button onclick="unblock('${log.ip}')">Снять блокировку</button>
      <p id="status-${log.ip}"></p>
    `;

    summary.addEventListener('click', () => {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    });

    checkStatus(log.ip);
    wrapper.appendChild(summary);
    wrapper.appendChild(details);
    container.appendChild(wrapper);
  });
}

async function checkStatus(ip) {
  const res = await fetch(`/status?ip=${ip}`);
  const status = await res.text();
  document.getElementById(`status-${ip}`).innerText = status;
}

async function unblock(ip) {
  await fetch('/unblock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip })
  });
  alert(`IP ${ip} разблокирован`);
  checkStatus(ip);
}
