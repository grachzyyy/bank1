document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const text = await res.text();
    const msgDiv = document.getElementById("message");

    if (res.status === 200) {
      if (username === "admin") {
        window.location.href = "/admin.html";
      } else {
        confetti();
        msgDiv.textContent = text;
        msgDiv.style.color = "green";
      }
    } else {
      msgDiv.textContent = text;
      msgDiv.style.color = "red";
    }
  } catch (err) {
    document.getElementById("message").textContent = "Ошибка сервера";
  }
});
