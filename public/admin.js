async function fetchLogs() {
  const res = await fetch('/admin-logs');
  const data = await res.json();

  const logsDiv = document.getElementById('logs');
  logsDiv.innerHTML = '';

  const header = document.createElement('h3');
  header.textContent = 'Попытки входа';
  logsDiv.appendChild(header);

  const logs = data.logs;

  logs.forEach(entry => {
    const div = document.createElement('div');
    div.style.marginBottom = '10px';
    div.style.padding = '10px';
    div.style.border = '1px solid #ccc';
    div.style.borderRadius = '8px';
    div.style.backgroundColor = '#fff';
    div.textContent = `Логин: ${entry.username}, IP: ${entry.ip}, Успех: ${entry.success ? 'да' : 'нет'}, Время: ${entry.time}`;
    logsDiv.appendChild(div);
  });
}
