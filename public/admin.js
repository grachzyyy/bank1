async function loadLogs() {
  const container = document.getElementById('logsContainer');
  const res = await fetch('/logs');
  const logs = await res.json();

  container.innerHTML = '';
  logs.forEach(log => {
    const div = document.createElement('div');
    div.textContent = `[${log.time}] ${log.ip} (${log.location}) - ${log.username} - ${log.success ? 'Успешно' : 'Ошибка'}${log.admin ? ' (Admin)' : ''}${log.reason ? ' - ' + log.reason : ''}`;
    container.appendChild(div);
  });
}

async function unblockIP() {
  const ip = document.getElementById('ipToUnblock').value;
  const res = await fetch('/unblock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip })
  });
  const text = await res.text();
  alert(text);
}
