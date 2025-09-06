// Productos S-35 - Datos reales
const productos = [
    {
        id: 1,
        nombre: "Estuco Base Pro+",
        descripcion: "Base de estuco de alta calidad para acabados profesionales",
        categoria: "estuco",
        imagen: "estuco-base-pro+.jpg"
    },
    {
        id: 2,
        nombre: "Basecoat Blanco Absoluto",
        descripcion: "Basecoat de máxima blancura para acabados perfectos",
        categoria: "basecoat",
        imagen: "BASECOAT-blanco-absoluto-Recuperado.jpg"
    },
    {
        id: 3,
        nombre: "Basecoat Gris",
        descripcion: "Basecoat gris para acabados neutros y elegantes",
        categoria: "basecoat",
        imagen: "BASECOAT-GRIS-Recuperado.jpg"
    },
    {
        id: 4,
        nombre: "Cellbond",
        descripcion: "Adhesivo celular de alta resistencia para construcción",
        categoria: "acabados",
        imagen: "CELLBOND.jpg"
    },
    {
        id: 5,
        nombre: "Cerámico",
        descripcion: "Acabado cerámico de larga duración y fácil mantenimiento",
        categoria: "acabados",
        imagen: "ceramico.jpg"
    },
    {
        id: 6,
        nombre: "Cubeta Darawell",
        descripcion: "Sistema de cubeta para aplicación profesional",
        categoria: "acabados",
        imagen: "CUBETA-DARAWELL.jpg"
    },
    {
        id: 7,
        nombre: "La Fina",
        descripcion: "Acabado fino de máxima calidad para interiores",
        categoria: "acabados",
        imagen: "La-fina.jpg"
    },
    {
        id: 8,
        nombre: "Mixandready",
        descripcion: "Producto listo para usar, sin necesidad de mezcla",
        categoria: "estuco",
        imagen: "MIXANDREADY.jpg"
    },
    {
        id: 9,
        nombre: "Pastablock",
        descripcion: "Pasta para bloques de construcción y reparación",
        categoria: "estuco",
        imagen: "Pastablock.jpg"
    },
    {
        id: 10,
        nombre: "Porcelánico Universal",
        descripcion: "Acabado porcelánico para todo tipo de superficies",
        categoria: "acabados",
        imagen: "porcelanico-universal.jpg"
    },
    {
        id: 11,
        nombre: "PSP+",
        descripcion: "Sistema PSP+ para acabados de alta resistencia",
        categoria: "acabados",
        imagen: "PSP+.jpg"
    },
    {
        id: 12,
        nombre: "Pulido Gris",
        descripcion: "Acabado pulido gris para superficies modernas",
        categoria: "acabados",
        imagen: "Pulido-Gris.jpg"
    },
    {
        id: 13,
        nombre: "Styrobond",
        descripcion: "Adhesivo especializado para poliestireno",
        categoria: "acabados",
        imagen: "STYROBOND.jpg"
    },
    {
        id: 14,
        nombre: "Ultraforce",
        descripcion: "Producto de ultra resistencia para aplicaciones exigentes",
        categoria: "estuco",
        imagen: "ULTRAFORCE.jpg"
    },
    {
        id: 15,
        nombre: "Waxtard Blanco Absoluto",
        descripcion: "Acabado encerado de máxima blancura",
        categoria: "acabados",
        imagen: "WAXTARD-BLANCO-ABSOLUTO.jpg"
    },
    {
        id: 16,
        nombre: "Waxtard Gris",
        descripcion: "Acabado encerado gris para superficies elegantes",
        categoria: "acabados",
        imagen: "waxtrard-gris.jpg"
    }
];

// Variables globales
let productosFiltrados = productos;
let currentCategory = 'all';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarNavegacion();
    inicializarFiltros();
    cargarProductos();
    inicializarFormulario();
    inicializarAnimaciones();
    inicializarContadores();
    inicializarVideo();
});

// Navegación móvil
function inicializarNavegacion() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Cerrar menú al hacer scroll
    window.addEventListener('scroll', function() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });

    // Controlar fondo de la navegación en scroll
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav');
        const hero = document.querySelector('.hero');
        const heroHeight = hero ? hero.offsetHeight : 0;
        
        if (window.scrollY > heroHeight * 0.1) { // Fondo aparece cuando scrolleas 10% del hero
            nav.classList.add('visible');
        } else {
            nav.classList.remove('visible');
        }
    });
}

// Filtros de productos
function inicializarFiltros() {
    const filterButtons = document.querySelectorAll('.category-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Añadir clase active al botón clickeado
            this.classList.add('active');
            
            // Filtrar productos
            const filtro = this.getAttribute('data-category');
            filtrarProductos(filtro);
        });
    });
}

function filtrarProductos(filtro) {
    currentCategory = filtro;
    
    if (filtro === 'all') {
        productosFiltrados = productos;
    } else {
        productosFiltrados = productos.filter(producto => producto.categoria === filtro);
    }
    
    cargarProductos();
}

// Cargar productos en el catálogo
function cargarProductos() {
    const productsGrid = document.getElementById('products-grid');
    
    if (!productsGrid) return;
    
    // Limpiar grid
    productsGrid.innerHTML = '';
    
    // Añadir animación de carga
    productsGrid.style.opacity = '0';
    
    setTimeout(() => {
        productosFiltrados.forEach((producto, index) => {
            const productoElement = crearElementoProducto(producto, index);
            productsGrid.appendChild(productoElement);
        });
        
        productsGrid.style.opacity = '1';
    }, 200);
}

function crearElementoProducto(producto, index) {
    const div = document.createElement('div');
    div.className = 'product-card fade-in';
    div.style.animationDelay = `${index * 0.1}s`;
    
    div.innerHTML = `
        <div class="product-image">
            <img src="Productos 2025/${producto.imagen}" alt="${producto.nombre}" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: var(--gray-100);">
                <i class="fas fa-cube" style="font-size: 2rem; color: var(--gray-400);"></i>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${producto.nombre}</h3>
            <p class="product-description">${producto.descripcion}</p>
            <span class="product-category">${producto.categoria}</span>
        </div>
    `;
    
    // Añadir efecto hover
    div.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px)';
    });
    
    div.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    return div;
}

// Formulario de contacto
function inicializarFormulario() {
    const formulario = document.querySelector('.contact-form');
    
    if (!formulario) return;
    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(this);
        const datos = {
            nombre: this.querySelector('input[type="text"]').value,
            email: this.querySelector('input[type="email"]').value,
            empresa: this.querySelectorAll('input[type="text"]')[1].value,
            mensaje: this.querySelector('textarea').value
        };
        
        // Validar datos
        if (!datos.nombre || !datos.email || !datos.mensaje) {
            mostrarNotificacion('Por favor, completa todos los campos obligatorios.', 'error');
            return;
        }
        
        // Simular envío
        mostrarNotificacion('¡Mensaje enviado correctamente! Te contactaremos pronto.', 'success');
        
        // Limpiar formulario
        this.reset();
    });
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    `;
    
    const colores = {
        success: '#30D158',
        error: '#FF3B30',
        info: '#007AFF'
    };
    
    notificacion.style.background = `linear-gradient(135deg, ${colores[tipo]}, ${colores[tipo]}dd)`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 5000);
}

// Animaciones al hacer scroll
function inicializarAnimaciones() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que deben animarse
    const elementosAnimables = document.querySelectorAll('.tech-card, .product-card, .innovation, .contact, .vision');
    elementosAnimables.forEach(elemento => {
        observer.observe(elemento);
    });

    // Animación específica para la sección de visión
    const visionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const visionElements = entry.target.querySelectorAll('.vision-header, .vision-title, .vision-description, .vision-commitment');
                visionElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }, index * 200);
                });
            }
        });
    }, { threshold: 0.3 });

    const visionSection = document.querySelector('.vision');
    if (visionSection) {
        visionObserver.observe(visionSection);
        
        // Animación de la línea superior
        const visionLine = visionSection.querySelector('.vision-line');
        if (visionLine) {
            const lineObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Pequeño delay para que se vea mejor
                        setTimeout(() => {
                            visionLine.classList.add('animate');
                        }, 200);
                    } else {
                        visionLine.classList.remove('animate');
                    }
                });
            }, { threshold: 0.1 });
            
            lineObserver.observe(visionSection);
        }
        
        // Efecto de scroll para la imagen de polvo
        const polvoImage = visionSection.querySelector('.polvo-image');
        if (polvoImage) {
            let ticking = false;
            
            const handleScroll = function() {
                if (!ticking) {
                    requestAnimationFrame(function() {
                        const rect = visionSection.getBoundingClientRect();
                        const sectionHeight = visionSection.offsetHeight;
                        const windowHeight = window.innerHeight;
                        
                        // Calcular el progreso de scroll dentro de la sección
                        const scrollProgress = Math.max(0, Math.min(1, 
                            (windowHeight - rect.top) / (windowHeight + sectionHeight)
                        ));
                        
                        // Efecto de escala: empieza grande (1.3) y se reduce a normal (1.0)
                        const scale = 1.3 - (scrollProgress * 0.3);
                        
                        // Efecto de opacidad: empieza más visible y se reduce ligeramente
                        const opacity = 0.9 - (scrollProgress * 0.1);
                        
                        // Aplicar transformación
                        polvoImage.style.transform = `scale(${scale})`;
                        polvoImage.style.opacity = opacity;
                        
                        ticking = false;
                    });
                    ticking = true;
                }
            };
            
            // Escuchar el evento de scroll
            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // Ejecutar una vez al cargar para establecer el estado inicial
            handleScroll();
        }
    }
}

// Contadores animados
function inicializarContadores() {
    const contadores = document.querySelectorAll('.stat-number, .data-number');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animarContador(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    contadores.forEach(contador => {
        observer.observe(contador);
    });
}

function animarContador(elemento) {
    const texto = elemento.textContent;
    const numero = parseInt(texto.replace(/\D/g, ''));
    const sufijo = texto.replace(/\d/g, '');
    
    if (isNaN(numero)) return;
    
    let actual = 0;
    const incremento = numero / 60; // 60 frames para 1 segundo
    const timer = setInterval(() => {
        actual += incremento;
        if (actual >= numero) {
            elemento.textContent = numero + sufijo;
            clearInterval(timer);
        } else {
            elemento.textContent = Math.floor(actual) + sufijo;
        }
    }, 16);
}

// Smooth scroll para enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Ajustar por la altura del nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Efecto parallax sutil
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const heroGrid = document.querySelector('.hero-grid');
    if (heroGrid) {
        heroGrid.style.transform = `translate(${scrolled * 0.1}px, ${scrolled * 0.1}px)`;
    }
});

// Efecto de typing en el título (opcional)
function efectoTyping() {
    const titulo = document.querySelector('.hero-title');
    if (!titulo) return;
    
    const texto = titulo.textContent;
    titulo.textContent = '';
    
    let i = 0;
    const timer = setInterval(() => {
        titulo.textContent += texto[i];
        i++;
        if (i >= texto.length) {
            clearInterval(timer);
        }
    }, 100);
}

// CSS adicional para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
    
    .fade-in {
        animation: fade-in 0.6s ease-out forwards;
    }
    
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Efectos de hover mejorados */
    .product-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .tech-card {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Efectos de glassmorphism */
    .floating-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(style);

// Preloader (opcional)
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Performance optimization
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

// Inicializar video de fondo
function inicializarVideo() {
    const video = document.querySelector('.hero-video');
    if (!video) {
        console.log('No se encontró el elemento video');
        return;
    }

    console.log('Inicializando video de fondo...');
    console.log('Ruta del video:', video.src || video.querySelector('source')?.src);

    // Asegurar que el video sea visible
    video.style.display = 'block';
    video.style.visibility = 'visible';

    // Configurar atributos del video
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.preload = 'auto';

    // Forzar carga del video
    video.load();

    // Manejar cuando el video está listo
    video.addEventListener('loadeddata', function() {
        console.log('Video cargado correctamente, intentando reproducir...');
        this.play().then(() => {
            console.log('Video reproduciéndose correctamente');
        }).catch(e => {
            console.log('Error al reproducir:', e);
        });
    });

    // Manejar errores de carga
    video.addEventListener('error', function(e) {
        console.log('Error cargando video:', e);
        console.log('Error details:', this.error);
    });

    // Intentar reproducir cuando pueda
    video.addEventListener('canplay', function() {
        console.log('Video puede reproducirse, iniciando...');
        this.play().catch(e => {
            console.log('No se pudo reproducir automáticamente:', e);
        });
    });

    // Intentar reproducir cuando esté listo
    video.addEventListener('canplaythrough', function() {
        console.log('Video completamente cargado, reproduciendo...');
        this.play().catch(e => {
            console.log('Error en reproducción:', e);
        });
    });

    // Forzar reproducción después de un delay
    setTimeout(() => {
        console.log('Intentando reproducción forzada...');
        video.play().then(() => {
            console.log('Reproducción exitosa');
        }).catch(e => {
            console.log('Reproducción fallida:', e);
            // Intentar con interacción del usuario
            document.addEventListener('click', function() {
                video.play().catch(err => console.log('Error al reproducir con click:', err));
            }, { once: true });
        });
    }, 1000);

    // Detectar dispositivos móviles
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    
    if (isMobile) {
        console.log('Dispositivo móvil detectado, configurando video pequeño');
        
        // En móvil, hacer el video más pequeño y optimizado
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.opacity = '0.8';
        
        // Intentar reproducir automáticamente en móvil
        setTimeout(() => {
            video.play().then(() => {
                console.log('Video reproduciéndose en móvil');
            }).catch(e => {
                console.log('No se pudo reproducir automáticamente en móvil:', e);
                // Si no se puede reproducir, mantener el fondo CSS
            });
        }, 500);
    }
}

// Optimizar scroll events
const optimizedScroll = debounce(function() {
    // Aquí van las funciones que se ejecutan en scroll
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
        
        console.log('Stack de cards configurado exitosamente');
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
            
            // Click para abrir modal en móvil
            if (window.innerWidth <= 768) {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.openModal(card);
                });
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
        let isMouseOver = false;
        let scrollSpeed = 0;
        const maxScrollSpeed = 5;
        const scrollZone = 100; // Zona de activación en píxeles desde los bordes

        this.stack.addEventListener('mouseenter', () => {
            isMouseOver = true;
        });

        this.stack.addEventListener('mouseleave', () => {
            isMouseOver = false;
            scrollSpeed = 0;
        });

        this.stack.addEventListener('mousemove', (e) => {
            if (!isMouseOver) return;

            const rect = this.stack.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const stackWidth = rect.width;

            // Calcular velocidad de scroll basada en la posición del mouse
            if (mouseX < scrollZone) {
                // Mouse cerca del borde izquierdo - scroll hacia la izquierda
                scrollSpeed = -maxScrollSpeed * (1 - mouseX / scrollZone);
            } else if (mouseX > stackWidth - scrollZone) {
                // Mouse cerca del borde derecho - scroll hacia la derecha
                scrollSpeed = maxScrollSpeed * ((mouseX - (stackWidth - scrollZone)) / scrollZone);
            } else {
                // Mouse en el centro - no scroll
                scrollSpeed = 0;
            }
        });

        // Animación de scroll suave
        const animateScroll = () => {
            if (scrollSpeed !== 0) {
                this.stack.scrollLeft += scrollSpeed;
            }
            requestAnimationFrame(animateScroll);
        };
        animateScroll();
    }

    setupTouch() {
        // Touch events para móvil - efecto Tinder
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
        // Quitar efecto de resaltado
        card.style.zIndex = '1';
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
    
    openModal(card) {
        const modal = document.getElementById('cardModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalClose = document.getElementById('modalClose');
        
        // Obtener datos de la card
        const cardImage = card.querySelector('img');
        const title = card.getAttribute('data-title');
        const description = card.getAttribute('data-description');
        
        // Configurar contenido del modal
        modalImage.src = cardImage.src;
        modalImage.alt = cardImage.alt;
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        
        // Mostrar modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Event listeners para cerrar modal
        modalClose.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
                this.closeModal();
            }
        });
        
        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        console.log('Modal abierto para:', title);
    }
    
    closeModal() {
        const modal = document.getElementById('cardModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        console.log('Modal cerrado');
    }
}

// Inicializar stack de cards cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new CardsStack();
});