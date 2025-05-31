const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = 3000;

const failedAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа

function logAttempt(ip, username, success) {
  const logs = fs.existsSync('logs.json') ? JSON.parse(fs.readFileSync('logs.json')) : [];
  logs.unshift({
    ip,
    username,
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    success
  });
  fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
}

app.post('/login', (req, res) => {
  const ip = req.ip;
  const { username, password } = req.body;
  const currentTime = Date.now();

  if (
    username !== 'admin' &&
    failedAttempts[ip] &&
    failedAttempts[ip].count >= MAX_ATTEMPTS &&
    currentTime - failedAttempts[ip].lastAttempt < BLOCK_TIME
  ) {
    const remaining = Math.ceil((BLOCK_TIME - (currentTime - failedAttempts[ip].lastAttempt)) / 60000);
    return res.status(403).send(`Вы заблокированы. Осталось: ${remaining} мин.`);
  }

  const isAdmin = username === 'admin' && password === '123456';
  const isUser = username === 'bankuser' && password === '123456';

  if (isAdmin) {
    failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
    logAttempt(ip, username, true);
    return res.send('Вход администратора');
  }

  if (isUser) {
    failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
    logAttempt(ip, username, true);
    return res.send(`Добро пожаловать, ${username}!`);
  }

  failedAttempts[ip] = failedAttempts[ip] || { count: 0, lastAttempt: 0 };
  failedAttempts[ip].count++;
  failedAttempts[ip].lastAttempt = currentTime;

  logAttempt(ip, username, false);

  const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
  if (attemptsLeft <= 0) {
    return res.status(403).send("Вы были заблокированы за множественные ошибки.");
  } else {
    return res.status(401).send(`Неверные данные. Осталось попыток: ${attemptsLeft}`);
  }
});

app.get('/logs', (req, res) => {
  const logs = fs.existsSync('logs.json') ? JSON.parse(fs.readFileSync('logs.json')) : [];
  res.json(logs);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
