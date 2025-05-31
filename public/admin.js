document.addEventListener('DOMContentLoaded', () => {
  const logsDiv = document.getElementById('logs');
  const ipStatus = document.getElementById('ip-status');
  const unblockBtn = document.getElementById('unblock-btn');

  fetch('/logs')
    .then(res => res.json())
    .then(logs => {
      logs.reverse().forEach(entry => {
        const div = document.createElement('div');
        div.classList.add('log-entry');
        div.textContent = `[${entry.time}] IP: ${entry.ip}, Логин: ${entry.username}, Пароль: ${entry.password}, Статус: ${entry.status}`;
        logsDiv.appendChild(div);
      });
    });

  fetch('/ip-status')
    .then(res => res.text())
    .then(status => {
      ipStatus.textContent = `Статус IP: ${status}`;
    });

  unblockBtn.addEventListener('click', () => {
    fetch('/unblock', { method: 'POST' })
      .then(res => res.text())
      .then(text => {
        alert(text);
        location.reload();
      });
  });
});
