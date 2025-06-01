const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const moment = require('moment');
const geoip = require('geoip-lite');
const xss = require('xss');
const app = express();
const PORT = process.env.PORT || 3000;

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000;

let failedAttempts = {};

app.use(bodyParser.json());
app.use(express.static('public'));

function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  return xf ? xf.split(',')[0] : req.socket.remoteAddress;
}

function sanitizeInput(input) {
  return xss(input.replace(/['";]/g, '')); // защита от SQL-инъекций и XSS
}

function loadLogs() {
  try {
    return JSON.parse(fs.readFileSync('logs.json'));
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
}

app.post('/login', (req, res) => {
  const ip = getClientIp(req);
  const time = new Date().toISOString();
  const { username, password } = req.body;

  // 🔒 Очистка от SQL и XSS атак
  const cleanUsername = sanitizeInput(username);
  const cleanPassword = sanitizeInput(password);

  // Геолокация
  const geo = geoip.lookup(ip) || {};
  const location = geo.city && geo.country ? `${geo.city}, ${geo.country}` : 'Неизвестно';

  if (cleanUsername === 'admin' && cleanPassword === '123456') {
    failedAttempts[ip] = { count: 0, lastAttempt: Date.now() };
    return res.send('admin');
  }

  if (failedAttempts[ip]?.count >= MAX_ATTEMPTS &&
      Date.now() - failedAttempts[ip].lastAttempt < BLOCK_TIME) {
    return res.status(403).send('Вы заблокированы на 4 часа.');
  }

  const success = cleanUsername === 'bankuser' && cleanPassword === '123456';
  const logs = loadLogs();
  logs.push({ ip, time, username: cleanUsername, password: cleanPassword, location, success });
  saveLogs(logs);

  if (!success) {
    if (!failedAttempts[ip]) failedAttempts[ip] = { count: 1, lastAttempt: Date.now() };
    else {
      failedAttempts[ip].count += 1;
      failedAttempts[ip].lastAttempt = Date.now();
    }

    if (failedAttempts[ip].count >= MAX_ATTEMPTS)
      return res.status(403).send('Вы заблокированы на 4 часа.');
    else
      return res.status(401).send(`Неверные данные. Осталось попыток: ${MAX_ATTEMPTS - failedAttempts[ip].count}`);
  }

  failedAttempts[ip] = { count: 0, lastAttempt: Date.now() };
  return res.send('ok');
});

app.get('/logs', (req, res) => {
  const logs = loadLogs().map(log => ({
    ...log,
    username: xss(log.username),
    password: xss(log.password),
  }));
  res.json(logs);
});

app.get('/status', (req, res) => {
  const ip = req.query.ip;
  const status = failedAttempts[ip];
  if (!status) return res.send('Не заблокирован');
  if (status.count < MAX_ATTEMPTS) return res.send('Не заблокирован');
  const timeLeft = BLOCK_TIME - (Date.now() - status.lastAttempt);
  return timeLeft > 0 ? res.send(`Заблокирован. Осталось: ${Math.ceil(timeLeft / 60000)} мин`) : res.send('Не заблокирован');
});

app.post('/unblock', (req, res) => {
  const ip = req.body.ip;
  delete failedAttempts[ip];
  res.send('Разблокировано');
});

app.listen(PORT, () => {
  console.log(`Сервер на http://localhost:${PORT}`);
});
