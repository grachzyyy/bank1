const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const app = express();

const PORT = 3000;
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа

const failedAttempts = {};
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/login', (req, res) => {
  const ip = req.ip;
  const time = moment().format('YYYY-MM-DD HH:mm:ss');
  const { username, password } = req.body;

  // Снятие блокировки если админ
  if (username === 'admin' && password === '123456') {
    failedAttempts[ip] = { count: 0, lastAttempt: 0 };
    logAttempt(ip, username, time, 'Успешный вход (админ)', false);
    return res.send('Админ вошёл успешно');
  }

  const currentTime = Date.now();
  if (failedAttempts[ip]?.count >= MAX_ATTEMPTS && currentTime - failedAttempts[ip].lastAttempt < BLOCK_TIME) {
    logAttempt(ip, username, time, 'Блокировка', true);
    return res.status(403).send('IP временно заблокирован. Попробуйте позже.');
  }

  if (username !== 'bankuser' || password !== '123456') {
    failedAttempts[ip] = failedAttempts[ip] || { count: 0, lastAttempt: 0 };
    failedAttempts[ip].count++;
    failedAttempts[ip].lastAttempt = currentTime;
    const remaining = MAX_ATTEMPTS - failedAttempts[ip].count;

    logAttempt(ip, username, time, 'Неверный ввод', failedAttempts[ip].count >= MAX_ATTEMPTS);

    if (remaining <= 0) {
      return res.status(403).send('Вы были заблокированы на 4 часа.');
    } else {
      return res.status(401).send(`Неверные данные. Осталось попыток: ${remaining}`);
    }
  }

  failedAttempts[ip] = { count: 0, lastAttempt: 0 };
  logAttempt(ip, username, time, 'Успешный вход', false);
  res.send(`Добро пожаловать, ${username}`);
});

app.get('/logs', (req, res) => {
  const logs = JSON.parse(fs.readFileSync('logs.json', 'utf8'));
  res.json(logs);
});

app.post('/unblock', (req, res) => {
  const ip = req.body.ip;
  delete failedAttempts[ip];
  res.send('Разблокировано');
});

function logAttempt(ip, username, time, result, blocked) {
  const logs = JSON.parse(fs.readFileSync('logs.json', 'utf8'));
  logs.push({ ip, username, time, result, blocked });
  fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
}

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
