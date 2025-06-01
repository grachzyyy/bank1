function loadLogs() {
  fetch('/logs')
    .then(res => res.json())
    .then(data => {
      const logsDiv = document.getElementById('logs');
      logsDiv.innerHTML = '';
      data.forEach(log => {
        const el = document.createElement('div');
        el.className = 'log-entry';
        el.innerHTML = `
          <strong>IP:</strong> ${log.ip}<br>
          <strong>Логин:</strong> ${log.username}<br>
          <strong>Успех:</strong> ${log.success}<br>
          <strong>Время:</strong> ${log.time}<br>
          <strong>Местоположение:</strong> ${log.location}<br>
          ${log.reason ? `<strong>Причина:</strong> ${log.reason}` : ''}
        `;
        logsDiv.appendChild(el);
      });
    });
}

function unblock() {
  const ip = document.getElementById('unblockIp').value;
  fetch('/unblock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip })
  })
    .then(res => res.text())
    .then(alert);
}
