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
const AUTO_SLIDE_INTERVAL = 5000; // 5 секунд

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

function nextSlide() {
   // console.log('nextSlide called, currentSlide before:', currentSlide);
    if (!totalSlides) return;
    currentSlide = (currentSlide + 1) % totalSlides;
   // console.log('nextSlide: new currentSlide:', currentSlide);
    showSlide(currentSlide);
}

function prevSlide() {
    if (!totalSlides) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
}

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

function handleSlideClick() {
    stopAutoSlide();
}

// Инициализация при загрузке страницы
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
