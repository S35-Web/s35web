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
        console.log('Dispositivo móvil detectado, configurando video para móvil');
        
        // En móvil, el fondo se maneja con CSS
        console.log('Fondo móvil configurado con CSS');
        
        // Ocultar video en móvil
        video.style.display = 'none';
        
        // Agregar botón de reproducción manual
        const playButton = document.createElement('button');
        playButton.innerHTML = '▶️ Reproducir Video';
        playButton.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 16px;
            cursor: pointer;
            z-index: 10;
            backdrop-filter: blur(10px);
        `;
        
        playButton.addEventListener('click', () => {
            video.style.display = 'block';
            video.play().then(() => {
                playButton.style.display = 'none';
                console.log('Video reproduciéndose en móvil');
            }).catch(e => {
                console.log('Error al reproducir en móvil:', e);
                playButton.innerHTML = '❌ Error al reproducir';
            });
        });
        
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            heroContent.appendChild(playButton);
        }
    }
}

// Optimizar scroll events
const optimizedScroll = debounce(function() {
    // Aquí van las funciones que se ejecutan en scroll
}, 16);

window.addEventListener('scroll', optimizedScroll);

// Chemical Code Animation
class ChemicalAnimation {
    constructor() {
        this.canvas = document.getElementById('chemicalCanvas');
        this.formulasContainer = document.getElementById('chemicalFormulas');
        this.formulas = [];
        this.connections = [];
        this.mousePosition = { x: 0, y: 0 };
        this.isActive = false;
        
        if (this.canvas && this.formulasContainer) {
            this.init();
        }
    }

    init() {
        this.createFormulas();
        this.setupEventListeners();
        this.startAnimation();
    }

    createFormulas() {
        const productData = [
            // Nombres de productos S-35
            { text: 'WAXTARD', type: 'product', category: 's35' },
            { text: 'CELLBOND', type: 'product', category: 's35' },
            { text: 'PEGAEXPRESS', type: 'product', category: 's35' },
            { text: 'BASECOAT', type: 'product', category: 's35' },
            { text: 'STYROBOND', type: 'product', category: 's35' },
            { text: 'ULTRAFORCE', type: 'product', category: 's35' },
            { text: 'PSP+', type: 'product', category: 's35' },
            { text: 'MIXANDREADY', type: 'product', category: 's35' },
            { text: 'PASTABLOCK', type: 'product', category: 's35' },
            { text: 'LA FINA', type: 'product', category: 's35' }
        ];

        const chemicalData = [
            // Fórmulas de construcción
            { text: 'Ca(OH)₂ + CO₂ → CaCO₃ + H₂O', type: 'formula', category: 'reaction' },
            { text: 'SiO₂ + 2NaOH → Na₂SiO₃ + H₂O', type: 'formula', category: 'reaction' },
            { text: 'C₃S + H₂O → C-S-H + Ca(OH)₂', type: 'formula', category: 'reaction' },
            { text: 'C₂S + H₂O → C-S-H + Ca(OH)₂', type: 'formula', category: 'reaction' },
            { text: 'C₃A + 3CaSO₄ + 32H₂O → AFt', type: 'formula', category: 'reaction' },
            { text: 'C₃S + C₂S + C₃A + C₄AF', type: 'formula', category: 'reaction' },
            { text: 'CaCO₃ + TiO₂ + Polymer', type: 'formula', category: 'reaction' },
            { text: 'SiO₂ + Al₂O₃ + Fe₂O₃', type: 'formula', category: 'reaction' },
            { text: 'C-S-H + CH + AFt', type: 'formula', category: 'reaction' },
            { text: 'C₃A + C₄AF + Gypsum', type: 'formula', category: 'reaction' },
            
            // Propiedades químicas
            { text: 'pH: 12.5-13.5', type: 'property', category: 'property' },
            { text: 'Densidad: 2.1-2.3 g/cm³', type: 'property', category: 'property' },
            { text: 'Resistencia: 25-50 MPa', type: 'property', category: 'property' },
            { text: 'Tiempo de fraguado: 2-6 horas', type: 'property', category: 'property' },
            { text: 'Contracción: <0.1%', type: 'property', category: 'property' },
            { text: 'Molienda: 325 mesh', type: 'property', category: 'property' },
            { text: 'Temperatura: 1450°C', type: 'property', category: 'property' },
            { text: 'Enfriamiento: 100°C/min', type: 'property', category: 'property' },
            { text: 'Mezclado: 3-5 min', type: 'property', category: 'property' },
            { text: 'Curado: 28 días', type: 'property', category: 'property' },
            
            // Aditivos y modificadores
            { text: 'Superplastificante: PCE', type: 'reaction', category: 'additive' },
            { text: 'Retardador: Na₂SO₄', type: 'reaction', category: 'additive' },
            { text: 'Acelerador: CaCl₂', type: 'reaction', category: 'additive' },
            { text: 'Hidrofugante: Si(OR)₄', type: 'reaction', category: 'additive' },
            { text: 'Fibras: PP, PVA, Steel', type: 'reaction', category: 'additive' }
        ];

        // Crear productos primero (más grandes, más visibles)
        productData.forEach((data, index) => {
            this.createFormulaElement(data, index);
        });

        // Crear fórmulas químicas (más pequeñas, de fondo)
        chemicalData.forEach((data, index) => {
            this.createFormulaElement(data, index + productData.length);
        });
    }

    createFormulaElement(data, index) {
        const formula = document.createElement('div');
        formula.className = `chemical-formula ${data.type} ${data.category}`;
        formula.textContent = data.text;
        
        // Posición aleatoria inicial con diferentes rangos según el tipo
        let x, y;
        if (data.type === 'product') {
            // Productos más centrados y visibles
            x = Math.random() * (this.canvas.offsetWidth - 400) + 200;
            y = Math.random() * (this.canvas.offsetHeight - 100) + 50;
        } else {
            // Fórmulas más distribuidas por toda la pantalla
            x = Math.random() * (this.canvas.offsetWidth - 300);
            y = Math.random() * (this.canvas.offsetHeight - 50);
        }
        
        formula.style.left = `${x}px`;
        formula.style.top = `${y}px`;
        
        // Agregar animaciones aleatorias solo a fórmulas de fondo
        if (data.type !== 'product' && Math.random() > 0.7) {
            formula.classList.add('flowing');
        } else if (data.type !== 'product' && Math.random() > 0.5) {
            formula.classList.add('pulsing');
        }
        
        this.formulasContainer.appendChild(formula);
        this.formulas.push({
            element: formula,
            data: data,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * (data.type === 'product' ? 0.2 : 0.5),
            vy: (Math.random() - 0.5) * (data.type === 'product' ? 0.2 : 0.5)
        });
    }

    setupEventListeners() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        // Mouse enter/leave
        this.canvas.addEventListener('mouseenter', () => {
            this.isActive = true;
            this.activateNearbyFormulas();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isActive = false;
            this.deactivateAllFormulas();
        });

        // Click interactions
        this.canvas.addEventListener('click', (e) => {
            this.handleClick(e);
        });
    }

    activateNearbyFormulas() {
        this.formulas.forEach(formula => {
            const distance = this.getDistance(formula, this.mousePosition);
            if (distance < 150) {
                formula.element.classList.add('active');
            }
        });
    }

    deactivateAllFormulas() {
        this.formulas.forEach(formula => {
            formula.element.classList.remove('active');
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Encontrar fórmula más cercana
        let closestFormula = null;
        let minDistance = Infinity;

        this.formulas.forEach(formula => {
            const distance = Math.sqrt(
                Math.pow(formula.x - clickX, 2) + Math.pow(formula.y - clickY, 2)
            );
            if (distance < minDistance && distance < 100) {
                minDistance = distance;
                closestFormula = formula;
            }
        });

        if (closestFormula) {
            this.animateFormula(closestFormula);
        }
    }

    animateFormula(formula) {
        // Efecto de explosión
        formula.element.style.transform = 'scale(1.5)';
        formula.element.style.opacity = '1';
        
        setTimeout(() => {
            formula.element.style.transform = 'scale(1)';
        }, 300);

        // Crear ondas de conexión
        this.createConnectionWaves(formula);
    }

    createConnectionWaves(centerFormula) {
        this.formulas.forEach(formula => {
            if (formula !== centerFormula) {
                const distance = this.getDistance(formula, centerFormula);
                if (distance < 200) {
                    this.createConnection(centerFormula, formula);
                }
            }
        });
    }

    createConnection(from, to) {
        const connection = document.createElement('div');
        connection.className = 'chemical-connection';
        
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const distance = this.getDistance(from, to);
        
        connection.style.left = `${from.x}px`;
        connection.style.top = `${from.y}px`;
        connection.style.width = `${distance}px`;
        connection.style.transform = `rotate(${angle}rad)`;
        connection.style.transformOrigin = '0 0';
        
        this.formulasContainer.appendChild(connection);
        
        setTimeout(() => {
            connection.remove();
        }, 800);
    }

    getDistance(formula1, formula2) {
        const x1 = typeof formula1 === 'object' ? formula1.x : formula1.x;
        const y1 = typeof formula1 === 'object' ? formula1.y : formula1.y;
        const x2 = typeof formula2 === 'object' ? formula2.x : formula2.x;
        const y2 = typeof formula2 === 'object' ? formula2.y : formula2.y;
        
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    startAnimation() {
        const animate = () => {
            this.formulas.forEach(formula => {
                // Movimiento suave
                formula.x += formula.vx;
                formula.y += formula.vy;
                
                // Rebote en bordes
                if (formula.x < 0 || formula.x > this.canvas.offsetWidth - 200) {
                    formula.vx *= -1;
                }
                if (formula.y < 0 || formula.y > this.canvas.offsetHeight - 50) {
                    formula.vy *= -1;
                }
                
                // Mantener dentro del canvas
                formula.x = Math.max(0, Math.min(formula.x, this.canvas.offsetWidth - 200));
                formula.y = Math.max(0, Math.min(formula.y, this.canvas.offsetHeight - 50));
                
                // Aplicar posición
                formula.element.style.left = `${formula.x}px`;
                formula.element.style.top = `${formula.y}px`;
                
                // Efecto de atracción al mouse
                if (this.isActive) {
                    const distance = this.getDistance(formula, this.mousePosition);
                    if (distance < 200) {
                        const force = (200 - distance) / 200 * 0.1;
                        const angle = Math.atan2(this.mousePosition.y - formula.y, this.mousePosition.x - formula.x);
                        formula.vx += Math.cos(angle) * force;
                        formula.vy += Math.sin(angle) * force;
                    }
                }
                
                // Limitar velocidad
                formula.vx = Math.max(-2, Math.min(2, formula.vx));
                formula.vy = Math.max(-2, Math.min(2, formula.vy));
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
}

// Inicializar animación química cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChemicalAnimation();
});