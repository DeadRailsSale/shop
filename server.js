const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Логирование для отладки
app.use((req, res, next) => {
  console.log(`Получен запрос: ${req.method} ${req.url}`);
  next();
});

// Раздача статических файлов
app.use(express.static('.')); // Для index.html
app.use('/images', express.static('images')); // Явно для папки images

// Явный маршрут для корня
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
