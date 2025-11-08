/**
 * =======================================================================
 * JAVASCRIPT ДЛЯ САЙТА KATUSHKI MVP
 * =======================================================================
 *
 * СТРУКТУРА ФАЙЛА:
 * 1. SPLASH SCREEN - экран приветствия для первого посещения
 * 2. ПЛАВНАЯ ПРОКРУТКА - для якорных ссылок
 * 3. КАРУСЕЛЬ HERO СЕКЦИИ - автоматическая смена слайдов
 * 4. ЭФФЕКТЫ ПОЯВЛЕНИЯ - анимации при прокрутке
 * 5. НАВИГАЦИЯ - обновление активных ссылок
 * =======================================================================
 */

/**
 * SPLASH SCREEN - ЭКРАН ПРИВЕТСТВИЯ ДЛЯ ПЕРВОГО ПОСЕЩЕНИЯ
 *
 * КОГДА ПОКАЗЫВАЕТСЯ:
 * - Только при первом посещении сайта (проверяется через localStorage)
 * - Повторные визиты не показывают splash screen
 *
 * КАК РАБОТАЕТ:
 * 1. При загрузке страницы проверяется localStorage на ключ 'katushki_splash_shown'
 * 2. Если ключ отсутствует - это первый визит, показывается splash
 * 3. После показа ключ записывается в localStorage для предотвращения повторных показов
 *
 * ВРЕМЕННАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ:
 * - Появление: мгновенно после проверки + 100мс задержка для анимации
 * - Отображение: ровно 2 секунды
 * - Исчезновение: 300мс анимация плавного ухода
 *
 * ОСОБЕННОСТИ:
 * - Блокирует прокрутку страницы (overflow: hidden)
 * - Полноэкранный overlay (z-index: 9999)
 * - Плавные CSS анимации появления/исчезновения
 * - Адаптивный дизайн для мобильных устройств
 */
(function() {
    // Ключ для localStorage
    const SPLASH_VISITED_KEY = 'katushki_splash_shown';
    const SPLASH_DURATION = 2000; // 2 секунды

    /**
     * Проверяет, посещал ли пользователь сайт ранее
     * @returns {boolean} true если это первый визит
     */
    function isFirstVisit() {
        return !localStorage.getItem(SPLASH_VISITED_KEY);
    }

    /**
     * Помечает пользователя как уже посещавшего сайт
     */
    function markAsVisited() {
        localStorage.setItem(SPLASH_VISITED_KEY, 'true');
    }

    /**
     * ОТОБРАЖАЕТ SPLASH SCREEN С ПОЛНОЙ АНИМАЦИЕЙ
     *
     * ПОСЛЕДОВАТЕЛЬНОСТЬ ДЕЙСТВИЙ:
     * 1. Создает HTML элемент splash screen
     * 2. Блокирует прокрутку страницы (overflow: hidden)
     * 3. Добавляет элемент в DOM
     * 4. Через 100мс добавляет класс 'show' для анимации появления
     * 5. Через 2 секунды убирает класс 'show' для анимации исчезновения
     * 6. Через дополнительные 300мс полностью удаляет элемент и разблокирует прокрутку
     *
     * @returns {Promise} Promise разрешается после полного завершения анимации
     */
    function showSplashScreen() {
        return new Promise((resolve) => {
            // Создаем HTML структуру splash screen
            const splash = document.createElement('div');
            splash.id = 'splash-screen';
            splash.innerHTML = `
                <div class="splash-content">
                    <h1>You are welcome titles..</h1>
                </div>
            `;

            // Блокируем прокрутку страницы на время показа
            document.body.style.overflow = 'hidden';
            document.body.appendChild(splash);

            // ЗАДЕРЖКА 100мс: плавное появление с анимацией
            setTimeout(() => {
                splash.classList.add('show'); // Запускает CSS анимацию появления
            }, 100);

            // ЗАДЕРЖКА SPLASH_DURATION (2000мс): время показа приветствия
            setTimeout(() => {
                splash.classList.remove('show'); // Запускает CSS анимацию исчезновения

                // ЗАДЕРЖКА 300мс: время на завершение анимации исчезновения
                setTimeout(() => {
                    splash.remove(); // Полностью удаляем элемент из DOM
                    document.body.style.overflow = ''; // Разблокируем прокрутку
                    resolve(); // Разрешаем Promise
                }, 300);
            }, SPLASH_DURATION);
        });
    }

    /**
     * ГЛАВНАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ SPLASH SCREEN
     *
     * ЛОГИКА РАБОТЫ:
     * 1. Вызывается при загрузке DOM (DOMContentLoaded)
     * 2. Проверяет, является ли текущий визит первым (isFirstVisit())
     * 3. Если ДА - показывает splash screen и помечает визит как совершенный
     * 4. Если НЕТ - ничего не делает (splash не показывается)
     *
     * ЭТО ГАРАНТИРУЕТ, ЧТО SPLASH ПОКАЗЫВАЕТСЯ ТОЛЬКО ОДИН РАЗ НА ПОЛЬЗОВАТЕЛЯ
     */
    function initSplashScreen() {
        if (isFirstVisit()) { // Только для первого посещения
            showSplashScreen().then(() => {
                markAsVisited(); // Помечаем, что пользователь уже видел splash
            });
        }
        // Для повторных посещений - ничего не делаем
    }

    // Запускаем splash screen при загрузке DOM
    document.addEventListener('DOMContentLoaded', initSplashScreen);
})();

/******************** ПЛАВНАЯ ПРОКРУТКА ДЛЯ ЯКОРНЫХ ССЫЛОК ********************/
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/******************** КАРУСЕЛЬ HERO СЕКЦИИ ********************/
/**
 * Глобальные переменные для управления каруселью
 * @global
 */
let currentSlide = 0; // Текущий активный слайд
let slides; // NodeList всех слайдов
let indicators; // NodeList всех индикаторов
let totalSlides; // Общее количество слайдов

/**
 * Переменные для автоматической смены слайдов
 * @global
 */
let slideInterval; // ID интервала для автоматической смены
let slideTimeout; // ID таймаута для задержки перед стартом
const AUTO_SLIDE_INTERVAL = 5000; // Интервал автоматической смены (5 секунд)

/**
 * Отображает указанный слайд и обновляет соответствующий индикатор
 * @param {number} index - Индекс слайда для отображения (0-based)
 */
function showSlide(index) {
    //console.log('showSlide called with index:', index, 'totalSlides:', totalSlides);
    if (!slides || !indicators || !totalSlides || index < 0 || index >= totalSlides) {
       // console.log('showSlide: invalid parameters');
        return;
    }

    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (slides[index]) {
        slides[index].classList.add('active');
        //console.log('Activated slide:', index);
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
        //console.log('Activated indicator:', index);
    }
}

/**
 * Переключается на следующий слайд в карусели
 * Если текущий слайд последний, переключается на первый
 */
function nextSlide() {
   // console.log('nextSlide called, currentSlide before:', currentSlide);
    if (!totalSlides) return;
    currentSlide = (currentSlide + 1) % totalSlides;
   // console.log('nextSlide: new currentSlide:', currentSlide);
    showSlide(currentSlide);
}

/**
 * Переключается на предыдущий слайд в карусели
 * Если текущий слайд первый, переключается на последний
 */
function prevSlide() {
    if (!totalSlides) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

/**
 * Останавливает автоматическую смену слайдов
 * Очищает интервал и таймаут для автоматического переключения
 */
function stopAutoSlide() {
   // console.log('stopAutoSlide called');
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
      //  console.log('cleared interval');
    }
    if (slideTimeout) {
        clearTimeout(slideTimeout);
        slideTimeout = null;
    //    console.log('cleared timeout');
    }
}

/**
 * Запускает автоматическую смену слайдов
 * Сначала останавливает существующие таймеры, затем запускает новый цикл
 */
    function startAutoSlide() {
     //   console.log('startAutoSlide called');
        stopAutoSlide();

        slideTimeout = setTimeout(() => {
     //       console.log('setTimeout triggered, calling nextSlide');
            nextSlide();
            slideInterval = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
     //       console.log('setInterval started');
        }, AUTO_SLIDE_INTERVAL);
}

/**
 * Обработчик клика по элементам управления каруселью
 * Останавливает автоматическую смену при ручном управлении
 */
function handleSlideClick() {
    stopAutoSlide();
}

/******************** ИНИЦИАЛИЗАЦИЯ КАРУСЕЛИ ********************/
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация карусели
    slides = document.querySelectorAll('.hero-slide');
    indicators = document.querySelectorAll('.indicator');
    totalSlides = slides.length;
   // console.log('slides found:', slides.length, 'indicators found:', indicators.length, 'totalSlides:', totalSlides);

    if (totalSlides > 0) {
        showSlide(0);
        startAutoSlide();
        
        const leftArrow = document.querySelector('.hero-arrow-left');
        const rightArrow = document.querySelector('.hero-arrow-right');
        
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                prevSlide();
                handleSlideClick();
            });
        }

        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                nextSlide();
                handleSlideClick();
            });
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                handleSlideClick();
            });
            indicator.addEventListener('mouseenter', stopAutoSlide);
            indicator.addEventListener('mouseleave', startAutoSlide);
        });

        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', stopAutoSlide);
            hero.addEventListener('mouseleave', startAutoSlide);
        }

        if (leftArrow) {
            leftArrow.addEventListener('mouseenter', stopAutoSlide);
            leftArrow.addEventListener('mouseleave', startAutoSlide);
        }

        if (rightArrow) {
            rightArrow.addEventListener('mouseenter', stopAutoSlide);
            rightArrow.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    /******************** ЭФФЕКТЫ ПОЯВЛЕНИЯ ПРИ ПРОКРУТКЕ ********************/
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    /******************** ОБНОВЛЕНИЕ АКТИВНОЙ ССЫЛКИ В НАВИГАЦИИ ********************/
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    if (navLinks.length > 0 && sections.length > 0) {
        let ticking = false;
        
        function updateActiveNav() {
            let current = '';
            const scrollY = window.pageYOffset;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                link.classList.toggle('active', href === `#${current}`);
            });
            
            ticking = false;
        }
        
        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateActiveNav);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', requestTick, { passive: true });
        updateActiveNav();
    }
});
