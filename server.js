const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = 3000;
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа
const LOG_FILE = 'logs.json';

app.use(bodyParser.json());
app.use(express.static('public'));

const failedAttempts = {};

function logAttempt(ip, username, status, action) {
  const logs = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE)) : [];
  logs.push({
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    ip,
    username,
    status,
    action
  });
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
}

app.post('/login', (req, res) => {
  const ip = req.ip;
  const { username, password } = req.body;
  const now = Date.now();

  // Проверка блокировки
  if (
    failedAttempts[ip] &&
    failedAttempts[ip].count >= MAX_ATTEMPTS &&
    now - failedAttempts[ip].lastAttempt < BLOCK_TIME &&
    username !== 'admin'
  ) {
    logAttempt(ip, username, 'BLOCKED', 'Too many failed attempts');
    const remaining = Math.ceil((BLOCK_TIME - (now - failedAttempts[ip].lastAttempt)) / 60000);
    return res.status(403).send(`IP заблокирован. Осталось: ${remaining} мин.`);
  }

  const isValid =
    (username === 'bankuser' && password === '123456') ||
    (username === 'admin' && password === '123456');

  if (!isValid) {
    failedAttempts[ip] = failedAttempts[ip] || { count: 0, lastAttempt: now };
    failedAttempts[ip].count++;
    failedAttempts[ip].lastAttempt = now;

    logAttempt(ip, username, 'FAILED', 'Wrong login or password');

    const left = MAX_ATTEMPTS - failedAttempts[ip].count;
    if (left <= 0) {
      return res.status(403).send('IP заблокирован на 4 часа.');
    } else {
      return res.status(401).send(`Неверный логин или пароль. Осталось попыток: ${left}`);
    }
  }

  // Сброс счётчика при входе админа
  if (username === 'admin') {
    failedAttempts[ip] = { count: 0, lastAttempt: 0 };
    logAttempt(ip, username, 'SUCCESS', 'Admin login - IP unblocked');
    return res.json({ success: true, admin: true });
  }

  failedAttempts[ip] = { count: 0, lastAttempt: 0 };
  logAttempt(ip, username, 'SUCCESS', 'User login');
  res.json({ success: true, admin: false });
});

app.get('/logs', (req, res) => {
  const logs = fs.existsSync(LOG_FILE) ? JSON.parse(fs.readFileSync(LOG_FILE)) : [];
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
