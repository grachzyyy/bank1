fetch('/logs')
  .then(res => res.json())
  .then(logs => {
    const tbody = document.querySelector('#logTable tbody');
    logs.reverse().forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${log.timestamp}</td>
        <td>${log.ip}</td>
        <td>${log.username}</td>
        <td>${log.status}</td>
        <td>${log.action}</td>
      `;
      tbody.appendChild(row);
    });
  });
