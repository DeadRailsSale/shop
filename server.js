const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Логирование всех запросов для отладки
app.use((req, res, next) => {
  console.log(`Получен запрос: ${req.method} ${req.url}`);
  next();
});

// Явный маршрут для корня
app.get('/', (req, res) => {
  console.log('Запрос к корню /');
  const filePath = path.resolve(__dirname, 'index.html');
  console.log(`Попытка отправить файл: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Ошибка при отправке index.html:', err);
      res.status(404).send('Not Found: index.html');
    }
  });
});

// Раздача статических файлов из корня
app.use(express.static('.'));
app.use(express.static('images'));

// Обработка POST-запросов на /send-order
app.post('/send-order', async (req, res) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const { content } = req.body;

  console.log('Получен запрос:', content);
  try {
    console.log('Попытка отправки в Discord с URL:', webhookUrl);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    if (response.ok) {
      res.status(200).json({ message: 'Заказ отправлен' });
    } else {
      console.log('Ошибка Discord:', response.status, await response.text());
      res.status(500).json({ message: 'Ошибка при отправке заказа' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Используем порт от Vercel
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
