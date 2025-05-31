const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = 3000;

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000;
const LOG_FILE = 'logs.json';

const failedAttempts = {};

function logAttempt({ ip, username, success, message }) {
  const logs = fs.existsSync(LOG_FILE)
    ? JSON.parse(fs.readFileSync(LOG_FILE))
    : [];

  logs.push({
    ip,
    time: Date.now(),
    username,
    success,
    message
  });

  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

app.post('/login', (req, res) => {
  const ip = req.ip;
  const now = Date.now();
  const { username, password } = req.body;

  if (
    failedAttempts[ip] &&
    failedAttempts[ip].count >= MAX_ATTEMPTS &&
    now - failedAttempts[ip].lastAttempt < BLOCK_TIME
  ) {
    const msg = 'Вы заблокированы на 4 часа.';
    logAttempt({ ip, username, success: false, message: msg });
    return res.status(403).send(msg);
  }

  // Admin вход
  if (username === 'admin' && password === 'admin123') {
    logAttempt({ ip, username, success: true, message: 'Вход администратора' });
    return res.send('Вход администратора успешен!');
  }

  // Стандартный вход
  if (username === 'bankuser' && password === '123456') {
    failedAttempts[ip] = { count: 0, lastAttempt: now };
    logAttempt({ ip, username, success: true, message: 'Успешный вход' });
    return res.send(`Добро пожаловать, ${username}!`);
  } else {
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 1, lastAttempt: now };
    } else {
      failedAttempts[ip].count++;
      failedAttempts[ip].lastAttempt = now;
    }

    const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
    const msg = attemptsLeft <= 0
      ? 'Вы были заблокированы на 4 часа за множественные ошибки входа.'
      : `Неверный логин или пароль. Осталось попыток: ${attemptsLeft}`;

    logAttempt({ ip, username, success: false, message: msg });

    return res.status(401).send(msg);
  }
});

// 🔐 Admin API
app.get('/admin/logs', (req, res) => {
  const logs = fs.existsSync(LOG_FILE)
    ? JSON.parse(fs.readFileSync(LOG_FILE))
    : [];
  res.json(logs);
});

app.post('/admin/clear-blocks', (req, res) => {
  for (let ip in failedAttempts) {
    failedAttempts[ip] = { count: 0, lastAttempt: 0 };
  }
  res.send('Блокировки успешно сброшены!');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
