const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', true); // Учитывать x-forwarded-for
app.use(bodyParser.json());
app.use(express.static('public'));

const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа

let failedAttempts = {}; // { ip: { count, lastAttempt } }

// Загрузка логов
let logs = [];
if (fs.existsSync('logs.json')) {
  logs = JSON.parse(fs.readFileSync('logs.json', 'utf8'));
}

function saveLogs() {
  fs.writeFileSync('logs.json', JSON.stringify(logs, null, 2));
}

function logAttempt(username, ip, status, info = '') {
  const entry = {
    time: moment().format('YYYY-MM-DD HH:mm:ss'),
    username,
    ip,
    status,
    info
  };
  logs.push(entry);
  saveLogs();
}

// Сброс IP (по запросу админки)
app.post('/reset-ip', (req, res) => {
  const { ip } = req.body;
  delete failedAttempts[ip];
  res.send({ success: true });
});

// Получить логи и статус блокировок
app.get('/logs', (req, res) => {
  res.json({ logs, failedAttempts });
});

// Авторизация
app.post('/login', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;
  const { username, password } = req.body;
  const currentTime = Date.now();

  // Проверка блокировки
  if (
    failedAttempts[ip] &&
    failedAttempts[ip].count >= MAX_ATTEMPTS &&
    currentTime - failedAttempts[ip].lastAttempt < BLOCK_TIME
  ) {
    const remaining = Math.ceil((BLOCK_TIME - (currentTime - failedAttempts[ip].lastAttempt)) / 60000);
    logAttempt(username, ip, 'Блокировка', `Осталось ${remaining} мин`);
    return res.status(403).send(`Вы заблокированы на 4 часа. Осталось: ${remaining} мин.`);
  }

  // Админ
  if (username === 'admin' && password === '123456') {
    delete failedAttempts[ip];
    logAttempt(username, ip, 'Успешный вход (админ)');
    return res.send({ success: true, admin: true });
  }

  // Обычный пользователь
  if (username === 'bankuser' && password === '123456') {
    failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
    logAttempt(username, ip, 'Успешный вход');
    return res.send({ success: true });
  } else {
    // Ошибочный вход
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 1, lastAttempt: currentTime };
    } else {
      failedAttempts[ip].count += 1;
      failedAttempts[ip].lastAttempt = currentTime;
    }

    const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
    logAttempt(username, ip, 'Неудачный вход', `Осталось попыток: ${attemptsLeft}`);

    if (attemptsLeft <= 0) {
      return res.status(403).send('Вы были заблокированы на 4 часа за множественные ошибки входа.');
    } else {
      return res.status(401).send(`Неверный логин или пароль. Осталось попыток: ${attemptsLeft}`);
    }
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
