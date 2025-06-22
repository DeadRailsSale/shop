const express = require('express');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const cors = require('cors'); // Добавляем cors

const app = express();
app.use(cors()); // Включаем CORS
app.use(express.json());
app.use(express.static('.'));

// Загружаем products.json в память при старте
let products;
try {
  products = require('./products.json');
} catch (error) {
  console.error('Error loading products.json:', error);
  products = []; // Используем пустой массив как fallback
}

app.get('/get-products', async (req, res) => {
  try {
    res.status(200).json(products);
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ success: false, message: 'Ошибка при получении товаров' });
  }
});

app.post('/add-product', async (req, res) => {
  const { name, price, image, category } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Заполните все обязательные поля' });
  }
  try {
    const newProduct = { id: uuidv4(), name, price, image, category };
    products.push(newProduct); // Обновляем данные в памяти
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Ошибка при добавлении товара' });
  }
});

app.post('/delete-product', async (req, res) => {
  const { id } = req.body;
  try {
    products = products.filter(product => product.id !== id); // Обновляем данные в памяти
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Ошибка при удалении товара' });
  }
});

app.post('/send-order', async (req, res) => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error('DISCORD_WEBHOOK_URL is not set');
    return res.status(500).json({ success: false, message: 'Серверная ошибка' });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (response.ok) {
      res.status(200).json({ success: true });
    } else {
      console.error('Discord webhook error:', response.statusText);
      res.status(500).json({ success: false, message: 'Ошибка при отправке заказа' });
    }
  } catch (error) {
    console.error('Error sending to Discord:', error);
    res.status(500).json({ success: false, message: 'Ошибка при отправке заказа' });
  }
});

app.post('/verify-admin', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set');
    return res.status(500).json({ success: false, message: 'Серверная ошибка' });
  }
  if (password === adminPassword) {
    res.status(200).json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Неверный пароль' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
