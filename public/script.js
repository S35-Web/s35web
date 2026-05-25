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
    let touchStartTime = 0;
    let touchStartY = 0;
    let isScrolling = false;
    
    flashlightHandlers.handleTouch = (e) => {
        if (!isMobile) return; // Skip on desktop
        
        const touch = e.touches[0];
        const currentTime = Date.now();
        
        // On touch start, record initial position and time
        if (e.type === 'touchstart') {
            touchStartTime = currentTime;
            touchStartY = touch.clientY;
            isScrolling = false;
            return; // Don't prevent default on touchstart
        }
        
        // On touch move, check if it's a scroll gesture
        if (e.type === 'touchmove') {
            const deltaY = Math.abs(touch.clientY - touchStartY);
            const deltaTime = currentTime - touchStartTime;
            
            // If significant vertical movement in short time, it's a scroll
            if (deltaY > 10 && deltaTime < 200) {
                isScrolling = true;
                return; // Don't prevent default, allow scroll
            }
            
            // If it's not a scroll gesture, activate flashlight effect
            if (!isScrolling && deltaTime > 100) { // Wait 100ms to distinguish from scroll
                e.preventDefault();
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
            }
        }
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
        // Mobile: No touch events to avoid scroll interference
        // Use the mobile button instead
        console.log('Mobile detected: Using button-based flashlight effect');
    } else {
        // Desktop: mouse events
        productsContent.addEventListener('mousemove', flashlightHandlers.handleMouseMove);
        productsContent.addEventListener('mouseleave', flashlightHandlers.handleMouseLeave);
    }
};

// Initialize flashlight effect
document.addEventListener('DOMContentLoaded', initFlashlightEffect);

// Optimize product images loading
const optimizeProductImages = () => {
    const productImages = document.querySelectorAll('.product-sample img');
    
    // Image mapping for fallback to JPG
    const imageMapping = {
        'estuco-base.png': 'estuco-base-pro+.jpg',
        'basecoat-blanco.png': 'BASECOAT-blanco-absoluto-Recuperado.jpg',
        'WAXTARD-BLANCO-ABSOLUTO.png': 'WAXTARD-BLANCO-ABSOLUTO.jpg',
        'ultraforce.png': 'ULTRAFORCE.jpg',
        'cellbond.png': 'CELLBOND.jpg',
        'styrobond.png': 'STYROBOND.jpg',
        'mixandready.png': 'MIXANDREADY.jpg',
        'porcelanico.png': 'porcelanico-universal.jpg',
        'cemento-plastico.png': 'cemento-plastico.jpg',
        'piso-sobre-piso.png': 'PSP+.jpg',
        'pastablock.png': 'Pastablock.jpg',
        'ceramico.png': 'ceramico.jpg',
        'basecoat.png': 'BASECOAT-GRIS-Recuperado.jpg',
        'WAXTARD-gris.png': 'waxtrard-gris.jpg'
    };
    
    // Add lazy loading and fallback to all product images
    productImages.forEach((img, index) => {
        img.loading = 'lazy';
        img.classList.add('loading');
        
        // Add loading state
        img.addEventListener('load', () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        });
        
        // Add error handling with JPG fallback
        img.addEventListener('error', () => {
            const currentSrc = img.src;
            const fileName = currentSrc.split('/').pop();
            const jpgFallback = imageMapping[fileName];
            
            if (jpgFallback) {
                img.src = `Productos 2025/${jpgFallback}`;
                console.log(`Fallback to JPG: ${fileName} -> ${jpgFallback}`);
            }
        });
        
        // Preload critical images (first row)
        if (index < 10) {
            img.loading = 'eager';
            img.classList.remove('loading');
            img.classList.add('loaded');
        }
    });
    
    // Add progressive loading for better UX
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });
    
    // Observe images for progressive loading
    productImages.forEach(img => {
        observer.observe(img);
    });
};

// Initialize image optimization
document.addEventListener('DOMContentLoaded', optimizeProductImages);

// Mobile flashlight effect disabled - desktop only
// The flashlight effect is now only available on desktop with mouse hover

// Navigation background adaptation for white sections
const initNavigationBackground = () => {
    const nav = document.querySelector('.nav');
    const whiteSections = document.querySelectorAll('.white-bg-section');
    
    if (!nav || whiteSections.length === 0) return;
    
    const checkNavigationBackground = () => {
        if (!nav.classList.contains('visible')) return;
        
        const navRect = nav.getBoundingClientRect();
        const navBottom = navRect.bottom;
        
        let isOnWhiteSection = false;
        
        whiteSections.forEach(section => {
            const sectionRect = section.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const sectionBottom = sectionRect.bottom;
            
            // Check if navigation is overlapping with white section
            if (navBottom > sectionTop && navRect.top < sectionBottom) {
                isOnWhiteSection = true;
            }
        });
        
        // Toggle dark tint class
        if (isOnWhiteSection) {
            nav.classList.add('on-white-bg');
        } else {
            nav.classList.remove('on-white-bg');
        }
    };
    
    // Check on scroll
    window.addEventListener('scroll', checkNavigationBackground);
    
    // Check on resize
    window.addEventListener('resize', checkNavigationBackground);
    
    // Initial check
    checkNavigationBackground();
};

// Initialize navigation background adaptation
document.addEventListener('DOMContentLoaded', initNavigationBackground);

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

// Animated counters for quality guarantees section
const animateQualityCounters = () => {
    const counters = document.querySelectorAll('.quality-stats .counter');
    
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
            
            // Trigger counter animation for quality guarantees section
            if (entry.target.classList.contains('quality-guarantees')) {
                setTimeout(animateQualityCounters, 500);
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
    const animateElements = document.querySelectorAll('.tech-card, .data-visualization, .feature, .consistency-card, .quality-guarantees');
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

// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForms = document.querySelectorAll('.contact-form');
    
    contactForms.forEach(contactForm => {
        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('.submit-btn');
                const originalBtnText = submitBtn ? submitBtn.textContent : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Enviando...';
                }

                // Get form data
                const formData = new FormData(this);
                const payload = {
                    nombre: formData.get('nombre') || formData.get('nombre-mobile') || '',
                    email: formData.get('email') || formData.get('email-mobile') || '',
                    empresa: formData.get('empresa') || formData.get('empresa-mobile') || '',
                    mensaje: formData.get('mensaje') || formData.get('mensaje-mobile') || '',
                    newsletter: !!formData.get('newsletter') || !!formData.get('newsletter-mobile'),
                    website: formData.get('website') || '' // honeypot
                };

                // Simple validation
                if (!payload.nombre || !payload.email || !payload.mensaje) {
                    alert('Por favor completa todos los campos obligatorios.');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                    return;
                }

                try {
                    const resp = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const data = await resp.json();
                    if (!resp.ok || !data.ok) {
                        throw new Error(data.error || 'No se pudo enviar el mensaje');
                    }

                    // Mostrar mensaje de éxito
                    const successMessage = data.message || '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.';
                    
                    // Crear modal de éxito
                    showSuccessModal(successMessage);
                    this.reset();
                } catch (error) {
                    console.error('Error enviando mensaje:', error);
                    alert('Ocurrió un error al enviar tu mensaje. Inténtalo de nuevo más tarde.');
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }
                }
            });
        }
    });
});

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
        this.centerFirstCard();
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

    centerFirstCard() {
        // Solo centrar la primera card sin forzar posiciones específicas
        setTimeout(() => {
            const stack = this.stack;
            if (!stack || !this.cards.length) return;
            
            // Scroll suave al inicio
            stack.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }, 100);
    }

}

// Inicializar stack de cards cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CardsStack();
});

// Pixel Rastreador para detectar color de fondo
class PixelTracker {
    constructor() {
        this.pixelTracker = document.getElementById('pixelTracker');
        this.nav = document.querySelector('.nav');
        this.canvas = null;
        this.ctx = null;
        this.isInitialized = false;
        
        if (this.pixelTracker && this.nav) {
            this.init();
        }
    }

    init() {
        // Crear canvas oculto para análisis de color
        this.canvas = document.createElement('canvas');
        this.canvas.width = 1;
        this.canvas.height = 1;
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.isInitialized = true;
        
        // Iniciar detección
        this.startDetection();
        
        console.log('Pixel Tracker inicializado');
    }

    startDetection() {
        if (!this.isInitialized) return;
        
        // Detectar color inicial con un pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            this.detectBackgroundColor();
        }, 100);
        
        // Detectar cambios en scroll
        window.addEventListener('scroll', this.throttle(() => {
            this.detectBackgroundColor();
        }, 100));
        
        // Detectar cambios en resize
        window.addEventListener('resize', this.throttle(() => {
            this.detectBackgroundColor();
        }, 100));
        
        // Agregar función de prueba global para debugging
        window.testPixelTracker = () => {
            console.log('=== PRUEBA DEL PIXEL TRACKER ===');
            this.detectBackgroundColor();
        };
    }

    detectBackgroundColor() {
        if (!this.isInitialized || !this.pixelTracker) return;
        
        try {
            // Obtener la sección actual visible en el viewport
            const currentSection = this.getCurrentVisibleSection();
            
            if (!currentSection) {
                console.log('No se encontró sección visible');
                this.setButtonStyle('default');
                return;
            }
            
            console.log('Sección detectada:', currentSection.tagName, currentSection.className);
            
            // Obtener el color de fondo de la sección actual
            const sectionStyle = window.getComputedStyle(currentSection);
            let backgroundColor = sectionStyle.backgroundColor;
            
            console.log('Color de fondo de la sección:', backgroundColor);
            
            // Si el color es transparente, buscar en elementos padre de la sección
            if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
                backgroundColor = this.findParentBackground(currentSection);
                console.log('Color de fondo del padre de la sección:', backgroundColor);
            }
            
            // Analizar el color
            this.analyzeColor(backgroundColor);
            
        } catch (error) {
            console.warn('Error en detección de color:', error);
            // Fallback: mantener estilo por defecto
            this.setButtonStyle('default');
        }
    }

    analyzeColor(backgroundColor) {
        console.log('Analizando color:', backgroundColor);
        
        if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') {
            console.log('Color transparente, buscando en elementos padre');
            // Si no hay color de fondo, usar el color del elemento padre
            this.detectParentBackground();
            return;
        }
        
        // Extraer valores RGB
        const rgbMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!rgbMatch) {
            console.log('No se pudo extraer valores RGB del color:', backgroundColor);
            this.setButtonStyle('default');
            return;
        }
        
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        
        console.log('Valores RGB:', r, g, b);
        
        // Solo cambiar a botones negros si el fondo es específicamente blanco
        if (r === 255 && g === 255 && b === 255) {
            console.log('Fondo blanco detectado - aplicando botones negros');
            this.setButtonStyle('light');
        } else {
            console.log('Fondo no es blanco - manteniendo botones por defecto');
            this.setButtonStyle('default');
        }
    }

    getCurrentVisibleSection() {
        // Obtener todas las secciones principales
        const sections = document.querySelectorAll('section, .hero, .vision, .interactive-3d-section, .water-section, .process-section, .stats-section, .products-showcase, .innovation, .consistency, .contact');
        
        const viewportHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        const viewportCenter = scrollTop + (viewportHeight / 2);
        
        let currentSection = null;
        let maxVisibility = 0;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + scrollTop;
            const sectionBottom = sectionTop + rect.height;
            
            // Calcular cuánto de la sección está visible en el viewport
            const visibleTop = Math.max(sectionTop, scrollTop);
            const visibleBottom = Math.min(sectionBottom, scrollTop + viewportHeight);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibilityRatio = visibleHeight / viewportHeight;
            
            // Si la sección está visible y tiene mayor visibilidad que la anterior
            if (visibilityRatio > 0.1 && visibilityRatio > maxVisibility) {
                maxVisibility = visibilityRatio;
                currentSection = section;
            }
        });
        
        return currentSection;
    }

    findParentBackground(element) {
        // Buscar el elemento padre más cercano con fondo
        let currentElement = element;
        let backgroundColor = null;
        
        while (currentElement && currentElement !== document.documentElement) {
            const style = window.getComputedStyle(currentElement);
            const bg = style.backgroundColor;
            
            console.log('Revisando elemento:', currentElement.tagName, currentElement.className, 'Color:', bg);
            
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                backgroundColor = bg;
                console.log('Color de fondo encontrado en:', currentElement.tagName, currentElement.className);
                break;
            }
            
            currentElement = currentElement.parentElement;
        }
        
        if (!backgroundColor) {
            // Fallback: usar el color del body
            const bodyStyle = window.getComputedStyle(document.body);
            backgroundColor = bodyStyle.backgroundColor;
            console.log('Usando color del body:', backgroundColor);
        }
        
        return backgroundColor;
    }

    detectParentBackground() {
        // Buscar el elemento padre más cercano con fondo
        let element = this.pixelTracker.parentElement;
        let backgroundColor = null;
        
        while (element && element !== document.body) {
            const style = window.getComputedStyle(element);
            const bg = style.backgroundColor;
            
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                backgroundColor = bg;
                break;
            }
            
            element = element.parentElement;
        }
        
        if (backgroundColor) {
            this.analyzeColor(backgroundColor);
        } else {
            // Fallback: usar el color del body
            const bodyStyle = window.getComputedStyle(document.body);
            this.analyzeColor(bodyStyle.backgroundColor);
        }
    }

    setButtonStyle(backgroundType) {
        if (!this.nav) return;
        
        // Remover clases anteriores
        this.nav.classList.remove('on-dark-bg', 'on-light-bg', 'on-default-bg');
        
        // Agregar clase correspondiente
        if (backgroundType === 'light') {
            this.nav.classList.add('on-light-bg');
            console.log('Fondo blanco detectado - aplicando botones negros');
        } else if (backgroundType === 'dark') {
            this.nav.classList.add('on-dark-bg');
            console.log('Fondo oscuro detectado - aplicando botones claros');
        } else {
            this.nav.classList.add('on-default-bg');
            console.log('Fondo por defecto - manteniendo botones originales');
        }
    }

    // Función throttle para optimizar rendimiento
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Método para forzar detección manual
    forceDetection() {
        this.detectBackgroundColor();
    }
}

// Mobile Footer Accordion functionality
document.addEventListener('DOMContentLoaded', function() {
    const accordionHeaders = document.querySelectorAll('.footer-accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accordionItem = this.parentElement;
            const isActive = accordionItem.classList.contains('active');
            
            // Close all other accordion items
            document.querySelectorAll('.footer-accordion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle current item
            if (!isActive) {
                accordionItem.classList.add('active');
            }
        });
    });
});

// Inicializar Pixel Tracker cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PixelTracker();
});

// Modal de éxito para formulario de contacto
function showSuccessModal(message) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;

    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        text-align: center;
        color: white;
        font-family: 'Inter', sans-serif;
    `;

    modal.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #4ade80; margin-bottom: 1rem;"></i>
        </div>
        <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; font-weight: 600;">¡Mensaje Enviado!</h3>
        <p style="margin: 0 0 1.5rem 0; color: #9ca3af; line-height: 1.5;">${message}</p>
        <button onclick="this.closest('.overlay').remove()" style="
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            border: none;
            border-radius: 12px;
            color: white;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            Entendido
        </button>
    `;

    overlay.className = 'overlay';
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Cerrar al hacer clic en el overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}
