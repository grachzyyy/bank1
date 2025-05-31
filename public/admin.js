async function loadLogs() {
  const res = await fetch('/logs');
  const logs = await res.json();
  const container = document.getElementById('logContainer');
  container.innerHTML = '';

  logs.forEach((entry, index) => {
    const div = document.createElement('div');
    div.classList.add('log-entry');
    div.innerHTML = `
      <strong>${index + 1}</strong>. 
      IP: ${entry.ip}, Логин: ${entry.username}, 
      Время: ${entry.time}, Результат: ${entry.result}, 
      Заблокирован: ${entry.blocked ? 'Да' : 'Нет'} 
      ${entry.blocked ? `<button onclick="unblock('${entry.ip}')">Разблокировать</button>` : ''}
    `;
    container.appendChild(div);
  });
}

function toggleLogs() {
  const container = document.getElementById('logContainer');
  if (container.style.display === 'none') {
    container.style.display = 'block';
    loadLogs();
  } else {
    container.style.display = 'none';
  }
}

async function unblock(ip) {
  const res = await fetch('/unblock', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ ip })
  });
  if (res.ok) {
    alert('IP разблокирован!');
    loadLogs();
  }
}
