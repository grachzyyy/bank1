async function showLogs() {
  const response = await fetch('/logs');
  const logs = await response.json();
  const container = document.getElementById('logsContainer');
  container.innerHTML = ''; // Очистка перед добавлением новых

  logs.forEach(log => {
    const div = document.createElement('div');
    div.style.borderBottom = '1px solid #ccc';
    div.style.padding = '8px';
    div.innerHTML = `
      <b>IP:</b> ${log.ip}<br>
      <b>Пользователь:</b> ${sanitize(log.username)}<br>
      <b>Время:</b> ${log.time}<br>
      <b>Успех:</b> ${log.success}<br>
      <b>Местоположение:</b> ${sanitize(log.location || 'неизвестно')}<br>
      <b>Причина:</b> ${sanitize(log.reason || '-')}`;
    container.appendChild(div);
  });
}

function unblockIP() {
  const ip = document.getElementById('ipInput').value;
  fetch('/unblock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip })
  }).then(res => res.text()).then(alert);
}

// XSS-защита: экранируем HTML
function sanitize(str) {
  return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
