<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Админ-панель</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="admin-box">
    <h2>Логи попыток входа</h2>
    <button onclick="toggleLogs()">Показать / Скрыть</button>
    <div id="logContainer" style="display: none;"></div>
  </div>
  <script src="admin.js"></script>
</body>
</html>
