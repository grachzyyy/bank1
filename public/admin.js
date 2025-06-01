async function loadLogs() {
  const res = await fetch('/logs');
  const logs = await res.json();

  const logsDiv = document.getElementById('logs');
  logsDiv.innerHTML = '';

  logs.forEach(log => {
    const logEntry = document.createElement('div');
    logEntry.classList.add('log-entry');

    const short = document.createElement('div');
    short.innerText = `${log.time} - ${log.username} - ${log.success ? 'Успех' : 'Ошибка'}`;
    short.style.cursor = 'pointer';
    short.style.fontWeight = 'bold';
    short.onclick = () => {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    };

    const details = document.createElement('div');
    details.style.display = 'none';
    details.innerHTML = `
      <p><b>IP:</b> ${log.ip}</p>
      <p><b>Местоположение:</b> ${log.location || 'Неизвестно'}</p>
      <p><b>Логин:</b> ${log.username}</p>
      <p><b>Пароль:</b> ${log.password}</p>
      <button onclick="unblock('${log.ip}')">🔓 Снять блокировку</button>
      <p id="status-${log.ip}" style="margin-top: 0.5rem;"></p>
    `;

    checkStatus(log.ip);

    logEntry.appendChild(short);
    logEntry.appendChild(details);
    logsDiv.appendChild(logEntry);
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
