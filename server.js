const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const fetch = require('node-fetch');
const app = express();

const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const logsFile = 'logs.json';
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000;

const failedAttempts = {};

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
}

// Функция очистки от XSS и SQL
function sanitizeInput(input) {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/--/g, '')
    .replace(/;/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '');
}

function saveLog(entry) {
  const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile)) : [];
  logs.unshift(entry);
  fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
}

async function getLocation(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    return `${data.city || 'Город неизвестен'}, ${data.country_name || 'Страна неизвестна'}`;
  } catch {
    return 'Местоположение не определено';
  }
}

app.post('/login', async (req, res) => {
  const ip = getClientIP(req);
  const now = Date.now();
  let { username, password } = req.body;

  // Защита от XSS и SQL-инъекций
  username = sanitizeInput(username);
  password = sanitizeInput(password);

  if (username === 'admin' && password === '123456') {
    saveLog({ time: moment().format(), ip, username, success: true, admin: true });
    return res.send('admin');
  }

  if (failedAttempts[ip] && failedAttempts[ip].count >= MAX_ATTEMPTS && now - failedAttempts[ip].lastAttempt < BLOCK_TIME) {
    saveLog({ time: moment().format(), ip, username, success: false, reason: 'Blocked' });
    return res.status(403).send('Вы заблокированы на 4 часа.');
  }

  const isCorrect = username === 'bankuser' && password === '123456';
  if (!isCorrect) {
    failedAttempts[ip] = failedAttempts[ip] || { count: 0, lastAttempt: 0 };
    failedAttempts[ip].count++;
    failedAttempts[ip].lastAttempt = now;

    const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
    const reason = attemptsLeft <= 0 ? 'Blocked' : 'Wrong credentials';
    saveLog({ time: moment().format(), ip, username, success: false, reason });

    return res.status(401).send(attemptsLeft <= 0
      ? 'Вы были заблокированы на 4 часа за множественные ошибки входа.'
      : `Неверный логин или пароль. Осталось попыток: ${attemptsLeft}`);
  }

  failedAttempts[ip] = { count: 0, lastAttempt: now };
  saveLog({ time: moment().format(), ip, username, success: true });
  res.send(`Добро пожаловать, ${username}!`);
});

app.get('/logs', async (req, res) => {
  const logs = fs.existsSync(logsFile) ? JSON.parse(fs.readFileSync(logsFile)) : [];
  const enriched = await Promise.all(logs.map(async (log) => {
    const location = await getLocation(log.ip);
    return { ...log, location };
  }));
  res.json(enriched);
});

app.post('/unblock', (req, res) => {
  const { ip } = req.body;
  if (failedAttempts[ip]) {
    delete failedAttempts[ip];
    return res.send('Блокировка снята.');
  }
  res.send('Этот IP не был заблокирован.');
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
