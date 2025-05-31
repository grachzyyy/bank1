document.getElementById("refreshBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("/logs");
    const logs = await res.json();
    const container = document.getElementById("logsContainer");

    container.innerHTML = "";

    logs.forEach((log, i) => {
      const block = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `${i + 1}. ${log.time} — ${log.ip} — ${log.username}`;
      block.appendChild(summary);

      const details = document.createElement("pre");
      details.textContent = JSON.stringify(log, null, 2);
      block.appendChild(details);

      container.appendChild(block);
    });
  } catch {
    alert("Ошибка загрузки логов.");
  }
});

window.onload = () => document.getElementById("refreshBtn").click();
