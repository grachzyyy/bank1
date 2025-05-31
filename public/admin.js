async function loadLogs() {
  const res = await fetch('/logs');
  const logs = await res.json();

  const table = document.getElementById("log-table");
  table.innerHTML = "";

  logs.forEach(log => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.time}</td>
      <td>${log.ip}</td>
      <td>${log.username}</td>
      <td>${log.status}</td>
    `;
    table.appendChild(row);
  });
}

document.getElementById("refresh").addEventListener("click", loadLogs);
document.getElementById("reset-blocks").addEventListener("click", async () => {
  await fetch('/reset', { method: 'POST' });
  alert("Блокировки сброшены");
});

loadLogs();
