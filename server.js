const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const moment = require('moment');
const app = express();

const PORT = 3000;
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000;

let failedAttempts = {};

app.use(bodyParser.json());
app.use(express.static('public'));

function logAttempt(ip, username, status) {
  const logs = fs.existsSync('logs.json') ? JSON.parse(fs.readFileSync('logs.json')) : [];
  logs.push({
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    ip,
    username,
    status
  });
  fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
}

app.post('/login', (req, res) => {
  const ip = req.ip;
  const { username, password } = req.body;
  const currentTime = Date.now();

  if (username === "admin" && password === "123456") {
    failedAttempts = {};
    logAttempt(ip, username, "успешный вход (админ)");
    return res.send("Админ вошёл");
  }

  if (failedAttempts[ip] && failedAttempts[ip].count >= MAX_ATTEMPTS && currentTime - failedAttempts[ip].lastAttempt < BLOCK_TIME) {
    logAttempt(ip, username, "заблокирован");
    return res.status(403).send("Вы заблокированы на 4 часа");
  }

  if (username === "bankuser" && password === "123456") {
    failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
    logAttempt(ip, username, "успешный вход");
    return res.send("Добро пожаловать!");
  } else {
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 1, lastAttempt: currentTime };
    } else {
      failedAttempts[ip].count += 1;
      failedAttempts[ip].lastAttempt = currentTime;
    }

    const left = MAX_ATTEMPTS - failedAttempts[ip].count;
    logAttempt(ip, username, "неверный пароль");

    if (left <= 0) {
      return res.status(403).send("Вы были заблокированы на 4 часа");
    }
    return res.status(401).send(`Неверный логин или пароль. Осталось попыток: ${left}`);
  }
});

app.get('/logs', (req, res) => {
  const logs = fs.existsSync('logs.json') ? JSON.parse(fs.readFileSync('logs.json')) : [];
  res.json(logs);
});

app.post('/reset', (req, res) => {
  failedAttempts = {};
  res.send("Блокировки сброшены");
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
