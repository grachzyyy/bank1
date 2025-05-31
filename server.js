const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const moment = require('moment');
const app = express();
const PORT = 3000;

app.set('trust proxy', true); // Доверие к x-forwarded-for
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

// Сброс попыток по IP (только для админа)
app.post('/reset-ip', (req, res) => {
  const { ip } = req.body;
  delete failedAttempts[ip];
  res.send({ success: true });
});

// Получение логов и статуса IP
app.get('/logs', (req, res) => {
  res.json({ logs, failedAttempts });
});

app.post('/login', (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.co
