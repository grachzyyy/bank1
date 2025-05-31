const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000;

const logsPath = 'logs.json';
const failedAttempts = {};

function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress || req.ip;
}

function saveLog(entry) {
  const logs = fs.existsSync(logsPath) ? JSON.parse(fs.readFileSync(logsPath)) : [];
  logs.push(entry);
  fs.writeFileSync(logsPath, JSON.stringify(logs, null, 2));
}

app.post('/login', (req, res) => {
  const ip = getIP(req);
  const currentTime = Date.now();
  const { username, password } = req.body;

  const isAdmin = username === 'admin' && password === '123456';
  const isUser = username === 'bankuser' && password === '123456';

  const logEntry = {
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    ip,
    username,
    password,
    status: isAdmin || isUser ? 'успешно' : 'неудачно'
  };
  saveLog(logEntry);

  if (!isAdmin) {
    const attempt = failedAttempts[ip] || { count: 0, lastAttempt: 0 };

    if (attempt.count >= MAX_ATTEMPTS && currentTime - attempt.lastAttempt < BLOCK_TIME) {
      const remaining = Math.ceil((BLOCK_TIME - (currentTime - attempt.lastAttempt)) / 60000);
      return res.status(403).send(`Вы заблокированы. Осталось: ${remaining} мин.`);
    }

    if (!isUser) {
      attempt.count++;
      attempt.lastAttempt = currentTime;
      failedAttempts[ip] = attempt;

      const attemptsLeft = MAX_ATTEMPTS - attempt.count;
      if (attemptsLeft <= 0) return res.status(403).send('Вы были заблокированы за множественные ошибки входа.');
      return res.status(401).send(`Неверные данные. Осталось попыток: ${attemptsLeft}`);
    }

    failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
  }

  if (isAdmin) return res.send('admin');
  if (isUser) return res.send('ok');

  return res.status(401).send('Неверные данные');
});

app.get('/logs', (req, res) => {
  const logs = fs.existsSync(logsPath) ? JSON.parse(fs.readFileSync(logsPath)) : [];
  res.send(logs);
});

app.get('/ip-status', (req, res) => {
  const ip = getIP(req);
  const attempt = failedAttempts[ip];
  if (attempt && attempt.count >= MAX_ATTEMPTS) return res.send('Заблокирован');
  res.send('Активен');
});

app.post('/unblock', (req, res) => {
  const ip = getIP(req);
  delete failedAttempts[ip];
  res.send('IP разблокирован');
});

app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
