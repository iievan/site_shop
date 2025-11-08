/**
 * Основной файл сервера для приложения Katushki MVP
 * Реализует веб-сервер с маршрутами для главной страницы, каталога и API
 */

const express = require('express');
const path = require('path');
const products = require('./data/products');
const config = require('./config/constants');

const app = express();

/**
 * Глобальный middleware для обработки непредвиденных ошибок
 * Логирует ошибки и отправляет стандартный ответ клиенту
 */
app.use((err, req, res, next) => {
    console.error('Middleware error:', err);
    res.status(500).send(config.MESSAGES.SERVER_ERROR);
});

/**
 * Настройка шаблонизатора EJS
 * Устанавливает EJS как движок шаблонов и путь к папке с шаблонами
 */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/**
 * Настройка статических файлов
 * Обслуживает CSS, JS файлы и изображения из папки public
 */
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Вспомогательная функция для поиска товара по ID
 * @param {string|number} id - ID товара для поиска
 * @returns {object|null} Найденный товар или null
 */
const findProductById = (id) => {
    return products.find(p => p.id === parseInt(id));
};

/**
 * Маршрут главной страницы
 * Отображает лендинг с избранными товарами для привлечения внимания
 * Показывает только ограниченное количество товаров для быстрой загрузки
 */
app.get('/', (req, res) => {
    try {
        // Получаем только первые товары для главной страницы
        // Это улучшает производительность и фокусирует внимание пользователя
        const featuredProducts = products.slice(0, config.HOMEPAGE_PRODUCTS_LIMIT);

        res.render('index', {
            title: 'Text header',
            products: featuredProducts
        });
    } catch (error) {
        console.error('Ошибка при рендеринге главной страницы:', error);
        res.status(500).send(config.MESSAGES.SERVER_ERROR);
    }
});

/**
 * API endpoint для получения всех товаров
 * Используется для AJAX запросов и интеграции с другими системами
 * Возвращает полный список товаров в формате JSON
 */
app.get('/api/products', (req, res) => {
    try {
        res.json(products);
    } catch (error) {
        console.error('Ошибка при получении товаров:', error);
        res.status(500).json({ error: config.MESSAGES.SERVER_ERROR });
    }
});

/**
 * API endpoint для получения конкретного товара по ID
 * @param {string} id - ID товара из URL параметра
 * Возвращает данные одного товара или 404 если товар не найден
 */
app.get('/api/products/:id', (req, res) => {
    try {
        const product = findProductById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: config.MESSAGES.PRODUCT_NOT_FOUND });
        }
    } catch (error) {
        console.error('Ошибка при получении товара:', error);
        res.status(500).json({ error: config.MESSAGES.SERVER_ERROR });
    }
});

/**
 * Маршрут для обработки покупки товара
 * Перенаправляет пользователя на внешний ресурс для совершения покупки
 * @param {string} productId - ID товара для покупки
 *
 * TODO: Настроить реальные ссылки для покупки после добавления товаров
 * В будущем здесь будут индивидуальные ссылки на каждый товар
 */
app.get('/buy/:productId', (req, res) => {
    try {
        const product = findProductById(req.params.productId);
        if (product) {
            const encodedProductName = encodeURIComponent(product.name);

            // ВРЕМЕННО: заглушка до настройки реальных ссылок
            // TODO: заменить на реальные ссылки товаров
            // const yarmarkaUrl = `https://www.livemaster.ru/search?q=${encodedProductName}`;

            // Пока перенаправляем на заглушку или каталог
            res.redirect('/catalog');
        } else {
            res.status(404).send(config.MESSAGES.PRODUCT_NOT_FOUND);
        }
    } catch (error) {
        console.error('Ошибка при переадресации:', error);
        res.status(500).send(config.MESSAGES.SERVER_ERROR);
    }
});

/**
 * Маршрут страницы каталога товаров с пагинацией
 * Отображает все товары с возможностью постраничного просмотра
 * Поддерживает параметры query: page (номер страницы) и limit (товаров на странице)
 *
 * Оптимизации:
 * - Ограничение максимального количества товаров на странице
 * - Валидация входных параметров
 * - Автоматический редирект при выходе за границы страниц
 */
app.get('/catalog', (req, res) => {
    try {
        // Парсинг и валидация параметров пагинации
        // Math.max(1, ...) гарантирует минимум 1 страницу
        const page = Math.max(1, parseInt(req.query.page) || 1);

        // Ограничение количества товаров на странице для производительности
        // Math.min(MAX, Math.max(1, ...)) гарантирует диапазон от 1 до MAX
        const limit = Math.min(config.MAX_PAGE_SIZE, Math.max(1, parseInt(req.query.limit) || config.DEFAULT_PAGE_SIZE));

        // Расчет индексов для среза массива товаров
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        // Получение товаров для текущей страницы
        const paginatedProducts = products.slice(startIndex, endIndex);
        const totalPages = Math.ceil(products.length / limit);

        // Автоматический редирект на последнюю страницу если запрошена несуществующая
        // Это предотвращает пустые страницы и улучшает UX
        if (page > totalPages && totalPages > 0) {
            return res.redirect('/catalog?page=' + totalPages);
        }

        // Рендеринг шаблона с данными пагинации
        res.render('catalog', {
            title: 'Каталог товаров',
            products: paginatedProducts,
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1
        });
    } catch (error) {
        console.error('Ошибка при рендеринге каталога:', error);
        res.status(500).send(config.MESSAGES.SERVER_ERROR);
    }
});

/**
 * Middleware для обработки 404 ошибок
 * Срабатывает когда маршрут не найден в приложении
 * Возвращает стандартное сообщение об ошибке
 */
app.use((req, res) => {
    res.status(404).send(config.MESSAGES.PAGE_NOT_FOUND);
});

/**
 * Финальный обработчик ошибок для Express
 * Ловит все необработанные ошибки в приложении
 * @param {Error} err - Объект ошибки
 * @param {object} req - Объект запроса
 * @param {object} res - Объект ответа
 * @param {function} next - Функция следующего middleware
 */
app.use((err, req, res, next) => {
    console.error('Необработанная ошибка:', err);
    res.status(500).send(config.MESSAGES.SERVER_ERROR);
});

/**
 * Запуск HTTP сервера
 * Приложение начинает прослушивать входящие соединения на указанном порту
 * Выводит информационное сообщение о успешном запуске
 */
app.listen(config.PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${config.PORT}`);
    console.log(`📖 Главная страница: http://localhost:${config.PORT}`);
    console.log(`🛍️  Каталог товаров: http://localhost:${config.PORT}/catalog`);
    console.log(`🔧 API товаров: http://localhost:${config.PORT}/api/products`);
});
