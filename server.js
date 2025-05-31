const express = require('express');
const bodyParser = require('body-parser');
const moment = require('moment');
const fs = require('fs');
const app = express();

const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const failedAttempts = {};
const MAX_ATTEMPTS = 5;
const BLOCK_TIME = 4 * 60 * 60 * 1000; // 4 часа

// Логирование
function logAttempt(ip, username, status) {
  const log = `[${moment().format('YYYY-MM-DD HH:mm:ss')}] IP: ${ip} | Логин: ${username} | Результат: ${status}\n`;
  fs.appendFileSync('login.log', log);
}

app.post('/login', (req, res) => {
  const ip = req.ip;
  const currentTime = Date.now();
  const { username, password } = req.body;

  // Администратор снимает блокировку
  if (username === 'admin' && password === '123456') {
    failedAttempts[ip] = { count: 0, lastAttempt: 0 };
    logAttempt(ip, username, 'Сброс блокировки (админ)');
    return res.send('Администратор: блокировки сброшены.');
  }

  // Проверка блокировки
  if (
    failedAttempts[ip] &&
    failedAttempts[ip].count >= MAX_ATTEMPTS &&
    currentTime - failedAttempts[ip].lastAttempt < BLOCK_TIME
  ) {
    const remaining = Math.ceil((BLOCK_TIME - (currentTime - failedAttempts[ip].lastAttempt)) / 60000);
    logAttempt(ip, username, 'Блокировка');
    return res.status(403).send(`Заблокировано на 4 часа. Осталось: ${remaining} мин.`);
  }

  // Проверка учётных данных
  if (username !== 'bankuser' || password !== '123456') {
    if (!failedAttempts[ip]) {
      failedAttempts[ip] = { count: 1, lastAttempt: currentTime };
    } else {
      failedAttempts[ip].count += 1;
      failedAttempts[ip].lastAttempt = currentTime;
    }

    const attemptsLeft = MAX_ATTEMPTS - failedAttempts[ip].count;
    logAttempt(ip, username, `Неверные данные (${attemptsLeft} попыток осталось)`);

    if (attemptsLeft <= 0) {
      return res.status(403).send('Вы были заблокированы на 4 часа.');
    } else {
      return res.status(401).send(`Неверный логин или пароль. Осталось попыток: ${attemptsLeft}`);
    }
  }

  // Успешный вход
  failedAttempts[ip] = { count: 0, lastAttempt: currentTime };
  logAttempt(ip, username, 'Успешный вход');
  res.send(`Добро пожаловать, ${username}!`);
});

app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
