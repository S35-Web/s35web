// Mobile Navigation
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Navigation scroll effect
let lastScrollTop = 0;
const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
});

// Hero video optimization for mobile
const heroVideo = document.querySelector('.hero-video');

if (heroVideo) {
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Try to play video on mobile with reduced opacity
        heroVideo.style.opacity = '0.7';
        heroVideo.style.filter = 'brightness(0.8) contrast(1.1)';
        heroVideo.style.transform = 'scale(1.1)';
        
        // Multiple attempts to play video
        const playVideo = () => {
            heroVideo.play().catch(e => {
                console.log('Video autoplay failed:', e);
                // If autoplay fails, try again after a delay
                setTimeout(playVideo, 1000);
            });
        };
        
        // Try to play when video can play
        heroVideo.addEventListener('canplay', playVideo);
        heroVideo.addEventListener('loadeddata', playVideo);
        heroVideo.addEventListener('canplaythrough', playVideo);
        
        // Force play after a delay
        setTimeout(playVideo, 500);
    } else {
        // Desktop: normal video behavior
        heroVideo.play().catch(e => {
            console.log('Video autoplay failed:', e);
        });
    }
}

// Process video optimization for mobile
const processVideo = document.querySelector('.process-video');

if (processVideo) {
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile: optimize for landscape format
        processVideo.style.objectFit = 'cover';
        processVideo.style.objectPosition = 'center center';
        processVideo.style.filter = 'grayscale(100%) contrast(1.4) brightness(0.8)';
        processVideo.style.opacity = '0.4';
        
        // Multiple attempts to play video
        const playProcessVideo = () => {
            processVideo.play().catch(e => {
                console.log('Process video autoplay failed:', e);
                // If autoplay fails, try again after a delay
                setTimeout(playProcessVideo, 1000);
            });
        };
        
        // Try to play when video can play
        processVideo.addEventListener('canplay', playProcessVideo);
        processVideo.addEventListener('loadeddata', playProcessVideo);
        processVideo.addEventListener('canplaythrough', playProcessVideo);
        
        // Force play after a delay
        setTimeout(playProcessVideo, 500);
    } else {
        // Desktop: optimize for portrait format
        processVideo.style.objectFit = 'cover';
        processVideo.style.objectPosition = 'center center';
        processVideo.style.filter = 'grayscale(100%) contrast(1.2)';
        processVideo.style.opacity = '0.3';
        
        // Desktop: normal video behavior
        processVideo.play().catch(e => {
            console.log('Process video autoplay failed:', e);
        });
    }
}

// Stats video optimization
const statsVideo = document.querySelector('.stats-video');

if (statsVideo) {
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile: optimize for landscape format
        statsVideo.style.objectFit = 'cover';
        statsVideo.style.objectPosition = 'center center';
        statsVideo.style.filter = 'brightness(0.5) contrast(1.2)';
        statsVideo.style.opacity = '0.5';
        
        // Multiple attempts to play video
        const playStatsVideo = () => {
            statsVideo.play().catch(e => {
                console.log('Stats video autoplay failed:', e);
                // If autoplay fails, try again after a delay
                setTimeout(playStatsVideo, 1000);
            });
        };
        
        // Try to play when video can play
        statsVideo.addEventListener('canplay', playStatsVideo);
        statsVideo.addEventListener('loadeddata', playStatsVideo);
        statsVideo.addEventListener('canplaythrough', playStatsVideo);
        
        // Force play after a delay
        setTimeout(playStatsVideo, 500);
    } else {
        // Desktop: optimize for portrait format
        statsVideo.style.objectFit = 'cover';
        statsVideo.style.objectPosition = 'center center';
        statsVideo.style.filter = 'brightness(0.6) contrast(1.1)';
        statsVideo.style.opacity = '0.4';
        
        // Desktop: normal video behavior
        statsVideo.play().catch(e => {
            console.log('Stats video autoplay failed:', e);
        });
    }
}

// Animated counters for stats section
const animateStatsCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        // Skip if already animated
        if (counter.classList.contains('animated')) {
            return;
        }
        
        const isDynamic = counter.getAttribute('data-dynamic');
        const numberElement = counter.querySelector('.number');
        let target;
        
        // Calculate dynamic years if needed
        if (isDynamic === 'years') {
            const startDate = new Date('1999-02-01'); // February 1999
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - startDate);
            const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25); // More accurate year calculation
            target = Math.round(diffYears * 10) / 10; // Round to 1 decimal place
        } else {
            target = parseFloat(counter.getAttribute('data-target'));
        }
        
        // Validate target value
        if (isNaN(target) || target <= 0) {
            console.warn('Invalid target value for counter:', target);
            return;
        }
        
        // If numberElement doesn't exist, use the counter itself
        const targetElement = numberElement || counter;
        
        // Mark as animated
        counter.classList.add('animated');
        
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                const displayValue = isDynamic === 'years' ? 
                    Math.round(current * 10) / 10 : // Keep decimal for years
                    Math.floor(current); // Integer for others
                targetElement.textContent = displayValue;
                requestAnimationFrame(updateCounter);
            } else {
                const finalValue = isDynamic === 'years' ? 
                    Math.round(target * 10) / 10 : 
                    target;
                targetElement.textContent = finalValue;
            }
        };
        
        updateCounter();
    });
};

// Intersection Observer for stats animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Trigger counter animation
            animateStatsCounters();
            // Stop observing this element to prevent multiple executions
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

// Observe stats section for animation
document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Products counter animation
const animateProductsCounter = () => {
    const counter = document.querySelector('.products-counter-number');
    
    if (!counter || counter.classList.contains('animated')) {
        return;
    }
    
    const numberElement = counter.querySelector('.number');
    const target = parseInt(counter.getAttribute('data-target'));
    
    if (isNaN(target) || target <= 0) {
        return;
    }
    
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        numberElement.textContent = Math.floor(current);
    }, 16);
    
    counter.classList.add('animated');
};

// Products counter observer
const productsCounterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateProductsCounter();
            productsCounterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

// Observe products section for counter animation
document.addEventListener('DOMContentLoaded', () => {
    const productsSection = document.querySelector('.products-showcase');
    if (productsSection) {
        productsCounterObserver.observe(productsSection);
    }
});

// Flashlight effect for products section
let flashlightHandlers = {
    handleMouseMove: null,
    handleMouseLeave: null,
    handleTouch: null,
    handleTouchEnd: null
};

const initFlashlightEffect = () => {
    const productsContent = document.querySelector('.products-content');
    const productsBackground = document.querySelector('.products-background');
    
    if (!productsContent || !productsBackground) return;
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;
    
    // Mouse move handler (desktop only)
    flashlightHandlers.handleMouseMove = (e) => {
        if (isMobile) return; // Skip on mobile
        
        const rect = productsContent.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Apply mask with vapor clearing effect - mouse moves vapor to reveal products
        // Simple mask: transparent center (reveals products) to opaque edges (keeps blur)
        const mask = `radial-gradient(circle 100px at ${x}% ${y}%, transparent 0%, transparent 5%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%)`;
        productsBackground.style.webkitMask = mask;
        productsBackground.style.mask = mask;
    };
    
    // Mouse leave handler (desktop only)
    flashlightHandlers.handleMouseLeave = () => {
        if (isMobile) return; // Skip on mobile
        productsBackground.style.webkitMask = 'none';
        productsBackground.style.mask = 'none';
    };
    
    // Touch handler (mobile only)
    let touchTimeout = null;
    let fadeOutInterval = null;
    
    flashlightHandlers.handleTouch = (e) => {
        if (!isMobile) return; // Skip on desktop
        
        e.preventDefault();
        const touch = e.touches[0];
        const rect = productsContent.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        
        // Clear any existing timeouts/intervals
        if (touchTimeout) clearTimeout(touchTimeout);
        if (fadeOutInterval) clearInterval(fadeOutInterval);
        
        // Apply mask with vapor clearing effect
        const mask = `radial-gradient(circle 100px at ${x}% ${y}%, transparent 0%, transparent 5%, rgba(0,0,0,0.1) 10%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.9) 90%, rgba(0,0,0,1) 100%)`;
        productsBackground.style.webkitMask = mask;
        productsBackground.style.mask = mask;
        
        // Start fade out after 2 seconds of no touch
        touchTimeout = setTimeout(() => {
            startFadeOut();
        }, 2000);
    };
    
    // Touch end handler for immediate fade out
    flashlightHandlers.handleTouchEnd = (e) => {
        if (!isMobile) return; // Skip on desktop
        
        // Clear the 2-second timeout
        if (touchTimeout) {
            clearTimeout(touchTimeout);
            touchTimeout = null;
        }
        
        // Start immediate fade out
        startFadeOut();
    };
    
    // Fade out function
    const startFadeOut = () => {
        if (fadeOutInterval) return; // Already fading out
        
        let opacity = 1;
        const fadeStep = 0.05; // How much to reduce opacity each step
        const fadeSpeed = 50; // Milliseconds between steps
        
        fadeOutInterval = setInterval(() => {
            opacity -= fadeStep;
            
            if (opacity <= 0) {
                // Fade complete - remove mask
                productsBackground.style.webkitMask = 'none';
                productsBackground.style.mask = 'none';
                clearInterval(fadeOutInterval);
                fadeOutInterval = null;
            } else {
                // Apply fading mask
                const currentMask = productsBackground.style.webkitMask;
                if (currentMask && currentMask !== 'none') {
                    // Extract position from current mask
                    const positionMatch = currentMask.match(/at ([\d.]+% [\d.]+%)/);
                    if (positionMatch) {
                        const position = positionMatch[1];
                        const fadedMask = `radial-gradient(circle 100px at ${position}, transparent 0%, transparent 5%, rgba(0,0,0,${0.1 * opacity}) 10%, rgba(0,0,0,${0.2 * opacity}) 20%, rgba(0,0,0,${0.3 * opacity}) 30%, rgba(0,0,0,${0.4 * opacity}) 40%, rgba(0,0,0,${0.5 * opacity}) 50%, rgba(0,0,0,${0.6 * opacity}) 60%, rgba(0,0,0,${0.7 * opacity}) 70%, rgba(0,0,0,${0.8 * opacity}) 80%, rgba(0,0,0,${0.9 * opacity}) 90%, rgba(0,0,0,${1 * opacity}) 100%)`;
                        productsBackground.style.webkitMask = fadedMask;
                        productsBackground.style.mask = fadedMask;
                    }
                }
            }
        }, fadeSpeed);
    };
    
    // Add event listeners based on device type
    if (isMobile) {
        // Mobile: touch events
        productsContent.addEventListener('touchstart', flashlightHandlers.handleTouch, { passive: false });
        productsContent.addEventListener('touchmove', flashlightHandlers.handleTouch, { passive: false });
        productsContent.addEventListener('touchend', flashlightHandlers.handleTouchEnd, { passive: false });
    } else {
        // Desktop: mouse events
        productsContent.addEventListener('mousemove', flashlightHandlers.handleMouseMove);
        productsContent.addEventListener('mouseleave', flashlightHandlers.handleMouseLeave);
    }
};

// Initialize flashlight effect
document.addEventListener('DOMContentLoaded', initFlashlightEffect);

// Re-initialize flashlight effect on window resize (for device rotation)
window.addEventListener('resize', () => {
    // Remove existing event listeners
    const productsContent = document.querySelector('.products-content');
    if (productsContent && flashlightHandlers.handleMouseMove) {
        productsContent.removeEventListener('mousemove', flashlightHandlers.handleMouseMove);
        productsContent.removeEventListener('mouseleave', flashlightHandlers.handleMouseLeave);
        productsContent.removeEventListener('touchstart', flashlightHandlers.handleTouch);
        productsContent.removeEventListener('touchmove', flashlightHandlers.handleTouch);
        productsContent.removeEventListener('touchend', flashlightHandlers.handleTouchEnd);
    }
    
    // Re-initialize with new device type
    initFlashlightEffect();
});

// Products Showcase Animations - Infinite Slider
const initProductsShowcase = () => {
    const productSamples = document.querySelectorAll('.product-sample');
    const sliderTrack = document.querySelector('.slider-track');
    const ctaBtn = document.querySelector('.products-cta-btn');
    
    // Intersection Observer for product samples
    const productObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = entry.target.style.transform.replace('scale(0)', 'scale(1)');
                }, index * 30);
            }
        });
    }, { threshold: 0.1 });
    
    // Initialize product samples
    productSamples.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = item.style.transform + ' scale(0)';
        item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        productObserver.observe(item);
    });
    
    // Slider pause on hover
    if (sliderTrack) {
        sliderTrack.addEventListener('mouseenter', () => {
            sliderTrack.style.animationPlayState = 'paused';
        });
        
        sliderTrack.addEventListener('mouseleave', () => {
            sliderTrack.style.animationPlayState = 'running';
        });
    }
    
    // Product sample hover effects
    productSamples.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Add subtle glow effect
            item.style.filter = 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.3))';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.filter = 'none';
        });
    });
    
    // CTA button animation
    if (ctaBtn) {
        ctaBtn.addEventListener('mouseenter', () => {
            ctaBtn.style.transform = 'translateY(-2px) scale(1.02)';
        });
        
        ctaBtn.addEventListener('mouseleave', () => {
            ctaBtn.style.transform = 'translateY(0) scale(1)';
        });
    }
};

// Initialize products showcase when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initProductsShowcase();
});

// Parallax effect for polvo image
const polvoImage = document.querySelector('.polvo-image');

if (polvoImage) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.8; // Much stronger parallax effect
        const scale = 1 + (scrolled * 0.0005); // Much stronger scale effect
        
        polvoImage.style.transform = `translateY(${parallax}px) scale(${scale})`;
    });
}

// Animated line for vision section
const visionLine = document.querySelector('.vision-line');

if (visionLine) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visionLine.style.width = '100%';
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(visionLine);
}

// Animated counters for innovation section
const animateCounters = () => {
    const counters = document.querySelectorAll('.data-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + (counter.textContent.includes('%') ? '%' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = counter.textContent;
            }
        };
        
        updateCounter();
    });
};

// Animated counters for consistency section
const animateConsistencyCounters = () => {
    const counters = document.querySelectorAll('.consistency-card .counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = prefix + target + suffix;
            }
        };
        
        updateCounter();
    });
};

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Trigger counter animation for data points
            if (entry.target.classList.contains('data-visualization')) {
                setTimeout(animateCounters, 500);
            }
            
            // Trigger counter animation for consistency cards
            if (entry.target.classList.contains('consistency-card')) {
                setTimeout(animateConsistencyCounters, 300);
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.tech-card, .data-visualization, .feature, .consistency-card');
    animateElements.forEach(el => observer.observe(el));
});

// Smooth scrolling for anchor links
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

// Optimized scroll handler
let ticking = false;

function updateScrollEffects() {
    // Update parallax effects
    const scrolled = window.pageYOffset;
    
    if (polvoImage) {
        const parallax = scrolled * 0.8; // Much stronger parallax effect
        const scale = 1 + (scrolled * 0.0005); // Much stronger scale effect
        polvoImage.style.transform = `translateY(${parallax}px) scale(${scale})`;
    }
    
    ticking = false;
}

function requestScrollUpdate() {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
}

window.addEventListener('scroll', requestScrollUpdate);

// Debounced scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const optimizedScroll = debounce(() => {
    // Any additional scroll optimizations can go here
}, 16);

window.addEventListener('scroll', optimizedScroll);

// Interactive Cards Stack
class CardsStack {
    constructor() {
        this.container = document.getElementById('cardsContainer');
        this.stack = document.getElementById('cardsStack');
        this.cards = document.querySelectorAll('.card-item');
        
        if (this.container && this.stack && this.cards.length > 0) {
            this.init();
        }
    }

    init() {
        console.log('Inicializando stack de cards...');
        
        this.setupCards();
        this.setupScroll();
        this.setupTouch();
        this.setupAnimations();
    }

    setupCards() {
        // Configurar cada card individualmente
        this.cards.forEach((card, index) => {
            // Agregar delay escalonado para animación de entrada
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Configurar eventos de hover
            card.addEventListener('mouseenter', () => {
                this.highlightCard(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.unhighlightCard(card);
            });
            
            // Configurar click
            card.addEventListener('click', () => {
                this.selectCard(card);
            });
            
            // Click para zoom en móvil
            if (window.innerWidth <= 768) {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleZoom(card);
                });
                
                // Agregar indicador visual de que es clickeable
                card.style.cursor = 'pointer';
                card.title = 'Toca para hacer zoom';
            }
        });
    }

    setupScroll() {
        // Scroll con movimiento del mouse para desktop
        if (window.innerWidth > 768) {
            this.setupMouseScroll();
        }
    }

    setupMouseScroll() {
        let isScrolling = false;
        let scrollDirection = 0;
        const scrollSpeed = 2;
        
        this.stack.addEventListener('mouseenter', () => {
            isScrolling = true;
        });
        
        this.stack.addEventListener('mouseleave', () => {
            isScrolling = false;
        });
        
        this.stack.addEventListener('mousemove', (e) => {
            if (!isScrolling) return;
            
            const rect = this.stack.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const containerWidth = rect.width;
            
            // Determine scroll direction based on mouse position
            if (mouseX < containerWidth * 0.2) {
                scrollDirection = -1; // Scroll left
            } else if (mouseX > containerWidth * 0.8) {
                scrollDirection = 1; // Scroll right
            } else {
                scrollDirection = 0; // No scroll
            }
        });
        
        // Smooth scrolling animation
        const scroll = () => {
            if (isScrolling && scrollDirection !== 0) {
                this.stack.scrollLeft += scrollDirection * scrollSpeed;
                requestAnimationFrame(scroll);
            }
        };
        
        requestAnimationFrame(scroll);
    }

    setupTouch() {
        // Touch gestures para móvil
        if (window.innerWidth <= 768) {
            this.setupTinderSwipe();
        }
    }

    setupTinderSwipe() {
        // Configurar scroll horizontal nativo
        this.stack.style.overflowX = 'auto';
        this.stack.style.overflowY = 'hidden';
        this.stack.style.scrollBehavior = 'smooth';
        this.stack.style.scrollbarWidth = 'none';
        this.stack.style.msOverflowStyle = 'none';
        this.stack.style.scrollSnapType = 'x mandatory';
        this.stack.style.webkitOverflowScrolling = 'touch';
        
        // Ocultar scrollbar en webkit
        const style = document.createElement('style');
        style.textContent = `
            .cards-stack::-webkit-scrollbar {
                display: none;
            }
        `;
        document.head.appendChild(style);
        
        // Configurar cada card para scroll horizontal
        this.cards.forEach((card, index) => {
            card.style.flexShrink = '0';
            card.style.position = 'relative';
            card.style.transform = 'none';
            card.style.opacity = '1';
            card.style.zIndex = '1';
            card.style.scrollSnapAlign = 'center';
            card.style.scrollSnapStop = 'always';
            
            // Remover todas las clases de estado
            card.classList.remove('swiping', 'swiped-left', 'swiped-right', 'returning');
        });
        
        // Configurar scroll suave entre cards
        this.setupSmoothScrolling();
        
        console.log('Carrusel horizontal configurado para móvil');
    }
    
    setupSmoothScrolling() {
        let isScrolling = false;
        let scrollTimeout;
        
        this.stack.addEventListener('scroll', () => {
            if (isScrolling) return;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Calcular la card más cercana al centro
                const containerWidth = this.stack.clientWidth;
                const scrollLeft = this.stack.scrollLeft;
                const center = scrollLeft + (containerWidth / 2);
                
                let closestCard = null;
                let closestDistance = Infinity;
                
                this.cards.forEach((card) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.left + (cardRect.width / 2);
                    const distance = Math.abs(cardCenter - center);
                    
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestCard = card;
                    }
                });
                
                // Si hay una card cercana, centrarla suavemente
                if (closestCard && closestDistance > 50) {
                    isScrolling = true;
                    const cardRect = closestCard.getBoundingClientRect();
                    const containerRect = this.stack.getBoundingClientRect();
                    const targetScroll = this.stack.scrollLeft + (cardRect.left - containerRect.left) - (containerWidth / 2) + (cardRect.width / 2);
                    
                    this.stack.scrollTo({
                        left: targetScroll,
                        behavior: 'smooth'
                    });
                    
                    setTimeout(() => {
                        isScrolling = false;
                    }, 300);
                }
            }, 150);
        });
    }

    setupAnimations() {
        // Animación de entrada
        this.cards.forEach((card, index) => {
            if (window.innerWidth <= 768) {
                // Móvil: animación simple para carrusel horizontal
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                // Desktop: animación normal
                card.style.opacity = '0';
                card.style.transform = 'translateY(50px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }

    highlightCard(card) {
        // Efecto de resaltado
        card.style.zIndex = '10';
        this.cards.forEach(otherCard => {
            if (otherCard !== card) {
                otherCard.style.opacity = '0.7';
                otherCard.style.transform = 'scale(0.95)';
            }
        });
    }

    unhighlightCard(card) {
        // Restaurar estado normal
        this.cards.forEach(otherCard => {
            otherCard.style.opacity = '1';
            otherCard.style.transform = 'scale(1)';
        });
    }

    selectCard(card) {
        // Efecto de selección
        card.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            card.style.transform = 'scale(1)';
        }, 150);
        
        console.log('Card seleccionada:', card.dataset.card);
    }
    
    toggleZoom(card) {
        // Toggle zoom effect
        if (card.classList.contains('zoomed')) {
            // Remove zoom
            card.classList.remove('zoomed');
            // Remove close button
            this.removeCloseButton(card);
            // Restore normal scroll behavior
            this.stack.style.overflow = 'auto';
            this.stack.style.scrollSnapType = 'x mandatory';
            console.log('Zoom removed from card:', card.dataset.card);
        } else {
            // Remove zoom from other cards first
            this.cards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('zoomed');
                    this.removeCloseButton(otherCard);
                }
            });
            
            // Add zoom to clicked card
            card.classList.add('zoomed');
            // Disable scroll while zoomed
            this.stack.style.overflow = 'hidden';
            this.stack.style.scrollSnapType = 'none';
            
            // Center the zoomed card
            const cardRect = card.getBoundingClientRect();
            const containerRect = this.stack.getBoundingClientRect();
            const centerX = containerRect.width / 2;
            const cardCenterX = cardRect.left - containerRect.left + (cardRect.width / 2);
            const scrollOffset = cardCenterX - centerX;
            
            this.stack.scrollTo({
                left: this.stack.scrollLeft + scrollOffset,
                behavior: 'smooth'
            });
            
            // Agregar botón de cerrar
            this.addCloseButton(card);
            
            console.log('Zoom added to card:', card.dataset.card);
        }
    }
    
    addCloseButton(card) {
        // Remover botón anterior si existe
        const existingButton = card.querySelector('.zoom-close-btn');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Crear botón de cerrar
        const closeButton = document.createElement('button');
        closeButton.className = 'zoom-close-btn';
        closeButton.innerHTML = '×';
        closeButton.title = 'Cerrar zoom';
        
        // Posicionar el botón
        closeButton.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;
        
        // Agregar hover effect
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(0, 0, 0, 0.9)';
            closeButton.style.transform = 'scale(1.1)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(0, 0, 0, 0.7)';
            closeButton.style.transform = 'scale(1)';
        });
        
        // Evento de click para cerrar
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleZoom(card);
        });
        
        card.appendChild(closeButton);
    }
    
    removeCloseButton(card) {
        const closeButton = card.querySelector('.zoom-close-btn');
        if (closeButton) {
            closeButton.remove();
        }
    }
}

// Inicializar stack de cards cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CardsStack();
});
