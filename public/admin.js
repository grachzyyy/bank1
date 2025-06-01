document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('log-container');
  const response = await fetch('/logs');
  const logs = await response.json();

  logs.forEach(log => {
    const div = document.createElement('div');
    div.classList.add('log-entry');
    div.innerHTML = `
      <strong>Время:</strong> ${escapeHtml(log.time)}<br>
      <strong>IP:</strong> ${escapeHtml(log.ip)}<br>
      <strong>Пользователь:</strong> ${escapeHtml(log.username)}<br>
      <strong>Успешно:</strong> ${log.success ? 'Да' : 'Нет'}<br>
      <strong>Местоположение:</strong> ${escapeHtml(log.location)}<br>
      ${log.reason ? `<strong>Причина:</strong> ${escapeHtml(log.reason)}<br>` : ''}
      ${log.admin ? `<strong>Вход администратора</strong><br>` : ''}
    `;
    container.appendChild(div);
  });
});

// Функция экранирования
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[tag]));
}
