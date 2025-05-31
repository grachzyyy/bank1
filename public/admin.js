async function fetchLogs() {
  const res = await fetch('/admin/logs');
  const logs = await res.json();
  const tbody = document.querySelector('#log-table tbody');
  tbody.innerHTML = '';
  logs.forEach(log => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${log.ip}</td>
      <td>${new Date(log.time).toLocaleString()}</td>
      <td>${log.username}</td>
      <td>${log.success ? '✅ Успех' : '❌ Ошибка'}</td>
      <td>${log.message}</td>
    `;
    tbody.appendChild(row);
  });
}

async function clearBlocks() {
  const res = await fetch('/admin/clear-blocks', { method: 'POST' });
  const result = await res.text();
  alert(result);
  fetchLogs();
}

fetchLogs();
