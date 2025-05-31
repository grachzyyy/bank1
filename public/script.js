document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const msg = await res.text();
  const messageDiv = document.getElementById("message");

  if (res.ok) {
    if (username === "admin") {
      window.location.href = "/admin.html";
    } else {
      messageDiv.style.color = "green";
      messageDiv.textContent = msg;
      confetti(); // запускаем конфетти
    }
  } else {
    messageDiv.style.color = "red";
    messageDiv.textContent = msg;
  }
});
