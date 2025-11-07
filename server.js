const express = require('express');
const path = require('path');
const products = require('./data/products');

const app = express();
const PORT = process.env.PORT || 3000;

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Статические файлы (CSS, JS, изображения)
app.use(express.static(path.join(__dirname, 'public')));

// Вспомогательная функция для поиска товара
const findProductById = (id) => {
    return products.find(p => p.id === parseInt(id));
};

// Главная страница
app.get('/', (req, res) => {
    try {
        res.render('index', {
            title: 'Вязаные вещи - Главная',
            products: products
        });
    } catch (error) {
        console.error('Ошибка при рендеринге главной страницы:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// API endpoint для получения всех товаров
app.get('/api/products', (req, res) => {
    try {
        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// API endpoint для получения конкретного товара
app.get('/api/products/:id', (req, res) => {
    try {
        const product = findProductById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Товар не найден' });
        }
    } catch (error) {
        console.error('Ошибка при получении товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Endpoint для переадресации на Ярмарку мастеров
app.get('/buy/:productId', (req, res) => {
    try {
        const product = findProductById(req.params.productId);
        if (product) {
            const encodedProductName = encodeURIComponent(product.name);
            const yarmarkaUrl = `https://www.livemaster.ru/search?q=${encodedProductName}`;
            res.redirect(yarmarkaUrl);
        } else {
            res.status(404).send('Товар не найден');
        }
    } catch (error) {
        console.error('Ошибка при переадресации:', error);
        res.status(500).send('Ошибка сервера');
    }
});

// Обработка 404
app.use((req, res) => {
    res.status(404).send('Страница не найдена');
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Необработанная ошибка:', err);
    res.status(500).send('Внутренняя ошибка сервера');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
