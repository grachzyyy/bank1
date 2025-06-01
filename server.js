const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const xss = require('xss');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000;
let failedAttempts = {};

app.use(bodyParser.json());
app.use(express.static('public'));

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
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

async function getLocation(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`);
    const data = await res.json();
    return `${data.country || 'Неизвестно'}, ${data.city || ''}`;
  } catch {
    return 'Неизвестно';
  }
}

app.post('/login', async (req, res) => {
  const ip = getClientIp(req);
  const username = xss(req.body.username);
  const password = xss(req.body.password);
  const now = Date.now();

  if (username === 'admin' && password === '123456') {
    failedAttempts[ip] = { count: 0, lastAttempt: now };
    return res.send('admin');
  }

  const record = failedAttempts[ip];
  if (record && record.count >= MAX_ATTEMPTS && now - record.lastAttempt < BLOCK_TIME) {
    return res.status(403).send('Вы заблокированы на 4 часа.');
  }

  const success = username === 'bankuser' && password === '123456';
  const location = await getLocation(ip);
  const logs = loadLogs();
  logs.push({ ip, location, time: new Date().toISOString(), username, password, success });
  saveLogs(logs);

  if (!success) {
    failedAttempts[ip] = record
      ? { count: record.count + 1, lastAttempt: now }
      : { count: 1, lastAttempt: now };

    const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
    if (attemptsLeft <= 0) {
      return res.status(403).send('Вы заблокированы на 4 часа.');
    } else {
      return res.status(401).send(`Неверные данные. Осталось попыток: ${attemptsLeft}`);
    }
  }

  failedAttempts[ip] = { count: 0, lastAttempt: now };
  res.send('ok');
});

app.get('/logs', (req, res) => {
  res.json(loadLogs());
});

app.get('/status', (req, res) => {
  const ip = req.query.ip;
  const record = failedAttempts[ip];
  if (!record || record.count < MAX_ATTEMPTS) return res.send('Не заблокирован');

  const timeLeft = BLOCK_TIME - (Date.now() - record.lastAttempt);
  if (timeLeft > 0) {
    return res.send(`Заблокирован. Осталось: ${Math.ceil(timeLeft / 60000)} мин`);
  }
  res.send('Не заблокирован');
});

app.post('/unblock', (req, res) => {
  delete failedAttempts[req.body.ip];
  res.send('Разблокировано');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
