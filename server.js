const express = require('express');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const productsFile = './products.json';

async function initProductsFile() {
  try {
    await fs.access(productsFile);
  } catch {
    await fs.writeFile(productsFile, JSON.stringify([
      { id: uuidv4(), name: 'Доктор', price: 26, image: 'images/alamo.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Майнер', price: 30, image: 'images/miner.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Музыкант', price: 30, image: 'images/musician.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Арсонист', price: 40, image: 'images/arsonist.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Мастер упаковки', price: 55, image: 'images/packmaster.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Некромант', price: 55, image: 'images/necromancer.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Аламо', price: 80, image: 'images/alamo.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Ковбой', price: 75, image: 'images/cowboy.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Кондуктор', price: 75, image: 'images/conductor.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Высокий роллер', price: 80, image: 'images/highroller.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Вереволк', price: 80, image: 'images/werewolf.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Выживший', price: 100, image: 'images/survivor.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Священник', price: 100, image: 'images/priest.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Вампир', price: 103, image: 'images/vampire.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Зомби', price: 105, image: 'images/zombie.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Милкмен', price: 55, image: 'images/milkman.png', category: 'classes' },
      { id: uuidv4(), name: 'Железный человек', price: 155, image: 'images/ironman.jpg', category: 'classes' },
      { id: uuidv4(), name: 'Подрывник', price: 75, image: 'images/demolitionist.png', category: 'classes' },
      { id: uuidv4(), name: 'Охотник', price: 75, image: 'images/hunter.png', category: 'classes' },
      { id: uuidv4(), name: 'Президент', price: 75, image: 'images/president.png', category: 'classes' },
      { id: uuidv4(), name: 'Крупный рогатый скот', price: 225, image: 'images/cattle.jpg', category: 'trains' },
      { id: uuidv4(), name: 'Золотая лихорадка', price: 300, image: 'images/goldrush.jpg', category: 'trains' },
      { id: uuidv4(), name: 'Бронированный', price: 320, image: 'images/armored.jpg', category: 'trains' },
      { id: uuidv4(), name: 'Стрелок', price: 150, image: '', category: 'achievements' },
      { id: uuidv4(), name: 'Магнат', price: 150, image: '', category: 'achievements' },
      { id: uuidv4(), name: 'Неубиваемый', price: 250, image: '', category: 'achievements' },
      { id: uuidv4(), name: 'Пони экспресс', price: 250, image: '', category: 'achievements' },
      { id: uuidv4(), name: 'Пацифист', price: 250, image: '', category: 'achievements' },
      { id: uuidv4(), name: 'Куча долларов', price: 250, image: '', category: 'achievements' },
      { id: uuidv4(), name: 'Электричество осталось', price: 300, image: '', category: 'achievements' }
    ], null, 2));
  }
}

app.get('/get-products', async (req, res) => {
  try {
    const products = JSON.parse(await fs.readFile(productsFile));
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
    const products = JSON.parse(await fs.readFile(productsFile));
    const newProduct = { id: uuidv4(), name, price, image, category };
    products.push(newProduct);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ success: false, message: 'Ошибка при добавлении товара' });
  }
});

app.post('/delete-product', async (req, res) => {
  const { id } = req.body;
  try {
    let products = JSON.parse(await fs.readFile(productsFile));
    products = products.filter(product => product.id !== id);
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
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
  initProductsFile();
});