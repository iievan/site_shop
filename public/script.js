// Плавная прокрутка для якорных ссылок
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

// Карусель Hero секции
let currentSlide = 0;
let slides;
let indicators;
let totalSlides;

// Автоматическая смена слайдов
let slideInterval;
let slideTimeout;
let lastClickTime = 0;
const AUTO_SLIDE_INTERVAL = 5000; // 5 секунд
const CLICK_COOLDOWN = 10000; // 10 секунд

function showSlide(index) {
    if (!slides || !indicators || !totalSlides || index < 0 || index >= totalSlides) {
        return;
    }
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    if (slides[index]) {
        slides[index].classList.add('active');
    }
    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
}

function nextSlide() {
    if (!totalSlides) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

function prevSlide() {
    if (!totalSlides) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

function stopAutoSlide() {
    if (slideInterval) {
        clearInterval(slideInterval);
        slideInterval = null;
    }
    if (slideTimeout) {
        clearTimeout(slideTimeout);
        slideTimeout = null;
    }
}

function startAutoSlide() {
    stopAutoSlide();
    
    let timeUntilNextSlide;
    
    if (lastClickTime === 0) {
        timeUntilNextSlide = AUTO_SLIDE_INTERVAL;
    } else {
        const timeSinceLastClick = Date.now() - lastClickTime;
        
        if (timeSinceLastClick >= CLICK_COOLDOWN) {
            timeUntilNextSlide = AUTO_SLIDE_INTERVAL;
            lastClickTime = 0;
        } else {
            timeUntilNextSlide = CLICK_COOLDOWN - timeSinceLastClick;
        }
    }
    
    slideTimeout = setTimeout(() => {
        nextSlide();
        slideInterval = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
        lastClickTime = 0;
    }, timeUntilNextSlide);
}

function handleSlideClick() {
    lastClickTime = Date.now();
    stopAutoSlide();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация карусели
    slides = document.querySelectorAll('.hero-slide');
    indicators = document.querySelectorAll('.indicator');
    totalSlides = slides.length;
    
    if (totalSlides > 0) {
        showSlide(0);
        startAutoSlide();
        
        const leftArrow = document.querySelector('.hero-arrow-left');
        const rightArrow = document.querySelector('.hero-arrow-right');
        
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                prevSlide();
                handleSlideClick();
                startAutoSlide();
            });
        }
        
        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                nextSlide();
                handleSlideClick();
                startAutoSlide();
            });
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                handleSlideClick();
                startAutoSlide();
            });
        });
        
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.addEventListener('mouseenter', stopAutoSlide);
            hero.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Эффект появления при прокрутке
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
    
    // Обновление активной ссылки в навигации
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
