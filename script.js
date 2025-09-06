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

// 3D Interactive Block Animation
class Interactive3D {
    constructor() {
        this.canvas = document.getElementById('threejs-canvas');
        this.container = document.getElementById('interactive3DCanvas');
        
        if (this.canvas && this.container) {
            this.init();
        }
    }

    init() {
        this.setupScene();
        this.loadModel();
        this.setupControls();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf8f9fa);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);

        // Renderer mejorado para texturas
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        // Lighting mejorado para texturas
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Luz adicional para mejor iluminación de texturas
        const pointLight1 = new THREE.PointLight(0xffffff, 0.6);
        pointLight1.position.set(-10, -10, -5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 0.4);
        pointLight2.position.set(0, 10, 0);
        this.scene.add(pointLight2);

        // Mouse controls
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.isMouseDown = false;
    }

    loadModel() {
        const loader = new THREE.OBJLoader();
        
        loader.load(
            'Assets/3d_cube.obj',
            (obj) => {
                this.model = obj;
                this.model.scale.set(2, 2, 2);
                this.model.position.set(0, 0, 0);
                this.model.castShadow = true;
                this.model.receiveShadow = true;
                
                // Debug: verificar el modelo OBJ
                console.log('Modelo OBJ cargado exitosamente');
                console.log('Modelo completo:', this.model);
                
                // Procesar cada mesh del modelo
                this.model.traverse((child) => {
                    if (child.isMesh) {
                        console.log('Mesh encontrado:', child.name);
                        console.log('Geometría:', child.geometry);
                        console.log('Material original:', child.material);
                        
                        // Crear material mejorado para el cemento
                        const material = new THREE.MeshStandardMaterial({
                            color: 0x8B8B8B,
                            roughness: 0.9,
                            metalness: 0.1,
                            vertexColors: true // Usar colores de vértices si están disponibles
                        });
                        
                        // Si la geometría tiene colores de vértices, usarlos
                        if (child.geometry.attributes.color) {
                            console.log('Colores de vértices encontrados');
                            material.vertexColors = true;
                        }
                        
                        // Si hay coordenadas de textura, crear textura procedural
                        if (child.geometry.attributes.uv) {
                            console.log('Coordenadas UV encontradas');
                            const texture = this.createCementTexture();
                            material.map = texture;
                        }
                        
                        child.material = material;
                        child.material.needsUpdate = true;
                        
                        console.log('Material actualizado:', child.material);
                    }
                });
                
                this.scene.add(this.model);
            },
            (progress) => {
                console.log('Cargando modelo OBJ:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error al cargar el modelo OBJ:', error);
                this.createFallbackCube();
            }
        );
    }

    createFallbackCube() {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        
        // Crear material más realista para cemento
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x8B8B8B,
            roughness: 0.9,
            metalness: 0.1,
            bumpScale: 0.1
        });
        
        // Crear textura procedural para simular cemento
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Fondo base
        ctx.fillStyle = '#8B8B8B';
        ctx.fillRect(0, 0, 512, 512);
        
        // Agregar textura de cemento
        ctx.fillStyle = '#A0A0A0';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3;
            ctx.fillRect(x, y, size, size);
        }
        
        // Crear textura desde canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        
        material.map = texture;
        material.needsUpdate = true;
        
        this.model = new THREE.Mesh(geometry, material);
        this.model.castShadow = true;
        this.model.receiveShadow = true;
        this.scene.add(this.model);
        
        console.log('Cubo de respaldo con textura creado');
    }

    createCementTexture() {
        // Crear textura procedural para simular cemento
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        // Fondo base
        ctx.fillStyle = '#8B8B8B';
        ctx.fillRect(0, 0, 512, 512);
        
        // Agregar textura de cemento
        ctx.fillStyle = '#A0A0A0';
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 3;
            ctx.fillRect(x, y, size, size);
        }
        
        // Agregar más detalles
        ctx.fillStyle = '#707070';
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = Math.random() * 2;
            ctx.fillRect(x, y, size, size);
        }
        
        // Crear textura desde canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 2);
        
        return texture;
    }

    setupControls() {
        this.container.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.mouseX = (e.clientX / this.container.offsetWidth) * 2 - 1;
                this.mouseY = -(e.clientY / this.container.offsetHeight) * 2 + 1;
                this.targetRotationY = this.mouseX * Math.PI;
                this.targetRotationX = this.mouseY * Math.PI * 0.5;
            }
        });

        this.container.addEventListener('mousedown', () => this.isMouseDown = true);
        this.container.addEventListener('mouseup', () => this.isMouseDown = false);
        this.container.addEventListener('mouseleave', () => this.isMouseDown = false);

        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.position.z += e.deltaY * 0.1;
            this.camera.position.z = Math.max(2, Math.min(10, this.camera.position.z));
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.model) {
            this.model.rotation.x += (this.targetRotationX - this.model.rotation.x) * 0.05;
            this.model.rotation.y += (this.targetRotationY - this.model.rotation.y) * 0.05;
            
            if (!this.isMouseDown) {
                this.model.rotation.y += 0.005;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Inicializar 3D interactivo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new Interactive3D();
});