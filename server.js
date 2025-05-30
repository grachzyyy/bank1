const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = 3000;

// Словарь IP-адресов: { ip: { count, lastAttempt } }
const failedAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа

app.post('/login', (req, res) => {
  const ip = req.ip;
  const currentTime = Date.now();
  const { username, password } = req.body;

  // Проверка на блокировку
  if (
    failedAttempts[ip] &&
    failedAttempts[ip].count >= MAX_ATTEMPTS &&
    currentTime - failedAttempts[ip].lastAttempt < BLOCK_TIME
  ) {
    const remaining = Math.ceil((BLOCK_TIME - (currentTime - failedAttempts[ip].lastAttempt)) / 60000);
    return res.status(403).send(`Вы заблокированы на 4 часа. Осталось: ${remaining} мин.`);
  }

  // Проверка пароля
  if (password !== '123456') {
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 1, lastAttempt: currentTime };
    } else {
      failedAttempts[ip].count += 1;
      failedAttempts[ip].lastAttempt = currentTime;
    }

    const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
    if (attemptsLeft <= 0) {
      return res.status(403).send('Вы были заблокированы на 4 часа за множественные ошибки входа.');
    } else {
      return res.status(401).send(`Неверный пароль. Осталось попыток: ${attemptsLeft}`);
    }
  }

  // Успешный вход
  failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
  res.send(`Добро пожаловать, ${username}!`);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
