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

// Parallax effect for polvo image
const polvoImage = document.querySelector('.polvo-image');

if (polvoImage) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.3;
        const scale = 1 + (scrolled * 0.0001);
        
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
        const parallax = scrolled * 0.3;
        const scale = 1 + (scrolled * 0.0001);
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
