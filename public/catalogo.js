// Catalog Page JavaScript

// Product data
const productData = {
    'estuco-base': {
        name: 'Estuco Base Pro+',
        category: 'Estuco',
        description: 'Fórmula avanzada de estuco base diseñada para proporcionar una base sólida y uniforme en sistemas de revestimiento. Desarrollada con tecnología de vanguardia para garantizar adherencia excepcional y durabilidad a largo plazo.',
        features: [
            'Adherencia superior en múltiples sustratos',
            'Tiempo de trabajo extendido para facilitar la aplicación',
            'Resistencia a la intemperie y rayos UV',
            'Fácil aplicación con herramientas convencionales',
            'Secado rápido y uniforme'
        ],
        applications: [
            'Revestimientos exteriores residenciales',
            'Edificios comerciales e industriales',
            'Renovación de fachadas existentes',
            'Sistemas de aislamiento térmico',
            'Proyectos de restauración patrimonial'
        ],
        images: [
            'Assets/productos_background/estuco-base.png',
            'Assets/productos_imagenes/estuco-base-pro+.jpg',
            'Assets/productos_background/estuco-base.png'
        ]
    },
    'basecoat-blanco': {
        name: 'Basecoat Blanco',
        category: 'Basecoat',
        description: 'Base de aplicación de alta calidad en color blanco, formulada para proporcionar una superficie uniforme y preparada para la aplicación de acabados finales. Ideal para proyectos que requieren máxima reflectividad y acabados perfectos.',
        features: [
            'Color blanco puro y estable',
            'Excelente poder cubriente',
            'Compatible con múltiples acabados',
            'Resistencia a la alcalinidad',
            'Aplicación en una sola capa'
        ],
        applications: [
            'Sistemas de revestimiento arquitectónico',
            'Fachadas de edificios comerciales',
            'Proyectos de alta visibilidad',
            'Renovación de espacios públicos',
            'Aplicaciones decorativas especiales'
        ],
        images: [
            'Assets/productos_background/basecoat-blanco.png',
            'Assets/productos_imagenes/BASECOAT-blanco-absoluto-Recuperado.jpg',
            'Assets/productos_background/basecoat-blanco.png'
        ]
    },
    'waxtard-blanco': {
        name: 'Waxtard Blanco Absoluto',
        category: 'Acabados',
        description: 'Acabado final de máxima calidad en blanco absoluto, diseñado para proporcionar protección duradera y estética excepcional. Formulado con tecnología avanzada para resistir las condiciones más exigentes.',
        features: [
            'Blanco absoluto con máxima reflectividad',
            'Resistencia superior a la intemperie',
            'Protección contra rayos UV',
            'Fácil limpieza y mantenimiento',
            'Acabado uniforme y profesional'
        ],
        applications: [
            'Acabados finales de alta gama',
            'Edificios institucionales',
            'Proyectos de arquitectura contemporánea',
            'Renovación de monumentos históricos',
            'Aplicaciones donde la estética es crítica'
        ],
        images: [
            'Assets/productos_background/WAXTARD-BLANCO-ABSOLUTO.png',
            'Assets/productos_imagenes/WAXTARD-BLANCO-ABSOLUTO.jpg',
            'Assets/productos_background/WAXTARD-BLANCO-ABSOLUTO.png'
        ]
    },
    'ultraforce': {
        name: 'Ultraforce',
        category: 'Adhesivos',
        description: 'Adhesivo de ultra alta resistencia diseñado para aplicaciones estructurales críticas. Formulado con polímeros de última generación para proporcionar uniones excepcionalmente fuertes y duraderas.',
        features: [
            'Resistencia adhesiva excepcional',
            'Aplicación en condiciones adversas',
            'Tiempo de curado optimizado',
            'Compatible con múltiples materiales',
            'Resistencia química superior'
        ],
        applications: [
            'Uniones estructurales críticas',
            'Reparaciones de alta resistencia',
            'Aplicaciones industriales',
            'Proyectos de infraestructura',
            'Situaciones de alta exigencia mecánica'
        ],
        images: [
            'Assets/productos_background/ultraforce.png',
            'Assets/productos_imagenes/ULTRAFORCE.jpg',
            'Assets/productos_background/ultraforce.png'
        ]
    },
    'cellbond': {
        name: 'Cellbond',
        category: 'Adhesivos',
        description: 'Adhesivo especializado para uniones celulares y porosas. Formulado para penetrar y crear uniones sólidas en materiales de baja densidad, proporcionando resistencia y durabilidad excepcionales.',
        features: [
            'Penetración profunda en materiales porosos',
            'Adherencia superior en superficies irregulares',
            'Tiempo de trabajo extendido',
            'Resistencia a la humedad',
            'Aplicación versátil'
        ],
        applications: [
            'Unión de materiales celulares',
            'Reparación de superficies porosas',
            'Aplicaciones en espumas y aislantes',
            'Proyectos de restauración',
            'Uniones en materiales de baja densidad'
        ],
        images: [
            'Assets/productos_background/cellbond.png',
            'Assets/productos_imagenes/CELLBOND.jpg',
            'Assets/productos_background/cellbond.png'
        ]
    },
    'styrobond': {
        name: 'Styrobond',
        category: 'Adhesivos',
        description: 'Adhesivo especializado para poliestireno expandido (EPS) y materiales similares. Formulado para crear uniones fuertes sin dañar el material base, ideal para sistemas de aislamiento térmico.',
        features: [
            'Compatible con poliestireno expandido',
            'No daña el material base',
            'Adherencia excepcional',
            'Resistencia térmica',
            'Aplicación limpia y controlada'
        ],
        applications: [
            'Sistemas de aislamiento térmico',
            'Unión de paneles EPS',
            'Aplicaciones en construcción verde',
            'Proyectos de eficiencia energética',
            'Sistemas de fachada ventilada'
        ],
        images: [
            'Assets/productos_background/styrobond.png',
            'Assets/productos_imagenes/STYROBOND.jpg',
            'Assets/productos_background/styrobond.png'
        ]
    },
    'mixandready': {
        name: 'Mixandready',
        category: 'Estuco',
        description: 'Estuco pre-mezclado listo para usar, diseñado para simplificar el proceso de aplicación. Solo requiere agregar agua para obtener una mezcla perfecta, garantizando consistencia y calidad en cada aplicación.',
        features: [
            'Pre-mezclado, solo agregar agua',
            'Consistencia garantizada',
            'Fácil aplicación',
            'Tiempo de trabajo optimizado',
            'Calidad uniforme en cada lote'
        ],
        applications: [
            'Aplicaciones residenciales',
            'Proyectos de renovación rápida',
            'Trabajos de mantenimiento',
            'Aplicaciones en obra pequeña',
            'Proyectos donde la simplicidad es clave'
        ],
        images: [
            'Assets/productos_background/mixandready.png',
            'Assets/productos_imagenes/MIXANDREADY.jpg',
            'Assets/productos_background/mixandready.png'
        ]
    },
    'porcelanico': {
        name: 'Porcelánico Universal',
        category: 'Acabados',
        description: 'Acabado porcelánico de aplicación universal, diseñado para proporcionar durabilidad excepcional y estética superior. Compatible con múltiples sustratos y condiciones de aplicación.',
        features: [
            'Aplicación universal',
            'Durabilidad excepcional',
            'Resistencia química superior',
            'Acabado uniforme y profesional',
            'Fácil mantenimiento'
        ],
        applications: [
            'Acabados de alta durabilidad',
            'Aplicaciones industriales',
            'Espacios de alto tráfico',
            'Proyectos comerciales',
            'Aplicaciones donde la durabilidad es crítica'
        ],
        images: [
            'Assets/productos_background/porcelanico.png',
            'Assets/productos_imagenes/porcelanico-universal.jpg',
            'Assets/productos_background/porcelanico.png'
        ]
    },
    'cemento-plastico': {
        name: 'Cemento Plástico',
        category: 'Adhesivos',
        description: 'Cemento de alta flexibilidad diseñado para aplicaciones donde se requiere movimiento y adaptabilidad. Formulado para mantener sus propiedades adhesivas bajo condiciones de tensión y deformación.',
        features: [
            'Alta flexibilidad',
            'Resistencia a la deformación',
            'Adherencia en condiciones de movimiento',
            'Durabilidad a largo plazo',
            'Aplicación versátil'
        ],
        applications: [
            'Juntas de dilatación',
            'Aplicaciones con movimiento',
            'Reparación de grietas',
            'Uniones flexibles',
            'Proyectos con requerimientos de adaptabilidad'
        ],
        images: [
            'Assets/productos_background/cemento-plastico.png',
            'Assets/productos_imagenes/cemento-plastico.jpg',
            'Assets/productos_background/cemento-plastico.png'
        ]
    },
    'piso-sobre-piso': {
        name: 'Piso Sobre Piso',
        category: 'Acabados',
        description: 'Sistema de acabado diseñado específicamente para aplicaciones sobre pisos existentes. Proporciona una superficie nueva y duradera sin necesidad de remover el piso original.',
        features: [
            'Aplicación sobre pisos existentes',
            'Adherencia excepcional',
            'Superficie uniforme y lisa',
            'Resistencia al desgaste',
            'Instalación rápida y eficiente'
        ],
        applications: [
            'Renovación de pisos existentes',
            'Proyectos de remodelación',
            'Aplicaciones comerciales',
            'Espacios de alto tráfico',
            'Proyectos de restauración'
        ],
        images: [
            'Assets/productos_background/piso-sobre-piso.png',
            'Assets/productos_imagenes/PSP+.jpg',
            'Assets/productos_background/piso-sobre-piso.png'
        ]
    },
    'pastablock': {
        name: 'Pastablock',
        category: 'Estuco',
        description: 'Estuco especializado para bloques de concreto y mampostería. Formulado para proporcionar adherencia excepcional y acabado uniforme en superficies de mampostería.',
        features: [
            'Adherencia superior en mampostería',
            'Relleno de juntas eficiente',
            'Acabado uniforme',
            'Resistencia a la intemperie',
            'Aplicación económica'
        ],
        applications: [
            'Mampostería de bloques',
            'Construcción tradicional',
            'Proyectos residenciales',
            'Renovación de muros existentes',
            'Aplicaciones en construcción rural'
        ],
        images: [
            'Assets/productos_background/pastablock.png',
            'Assets/productos_imagenes/Pastablock.jpg',
            'Assets/productos_background/pastablock.png'
        ]
    },
    'ceramico': {
        name: 'Cerámico',
        category: 'Acabados',
        description: 'Acabado cerámico de alta calidad diseñado para proporcionar durabilidad excepcional y estética superior. Ideal para aplicaciones donde se requiere resistencia química y mecánica.',
        features: [
            'Resistencia química superior',
            'Durabilidad excepcional',
            'Acabado cerámico auténtico',
            'Fácil limpieza y mantenimiento',
            'Resistencia a la abrasión'
        ],
        applications: [
            'Aplicaciones industriales',
            'Espacios de alta exigencia',
            'Proyectos comerciales',
            'Aplicaciones químicas',
            'Espacios donde la durabilidad es crítica'
        ],
        images: [
            'Assets/productos_background/ceramico.png',
            'Assets/productos_imagenes/ceramico.jpg',
            'Assets/productos_background/ceramico.png'
        ]
    }
};

// Initialize catalog functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeProductCards();
    initializeModal();
    initializeImageZoom();
});

// Filter functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            productCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.6s ease-out forwards';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Product card functionality
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.getAttribute('data-product');
            openProductModal(productId);
        });
    });
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('modalClose');
    const backdrop = document.querySelector('.modal-backdrop');
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Open product modal
function openProductModal(productId) {
    const modal = document.getElementById('productModal');
    const product = productData[productId];
    
    if (!product) return;
    
    // Update modal content
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productCategory').textContent = product.category;
    document.getElementById('productDescription').textContent = product.description;
    
    // Update features
    const featuresList = document.getElementById('productFeatures');
    featuresList.innerHTML = '';
    product.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
    });
    
    // Update applications
    const applicationsList = document.getElementById('productApplications');
    applicationsList.innerHTML = '';
    product.applications.forEach(application => {
        const li = document.createElement('li');
        li.textContent = application;
        applicationsList.appendChild(li);
    });
    
    // Update images
    updateProductImages(product.images);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Update product images
function updateProductImages(images) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    
    // Set main image
    mainImage.src = images[0];
    mainImage.alt = 'Producto principal';
    
    // Clear and populate thumbnails
    thumbnailGallery.innerHTML = '';
    
    images.forEach((imageSrc, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-item';
        if (index === 0) thumbnail.classList.add('active');
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = `Vista ${index + 1}`;
        img.loading = 'lazy';
        
        thumbnail.appendChild(img);
        thumbnailGallery.appendChild(thumbnail);
        
        // Add click handler
        thumbnail.addEventListener('click', function() {
            // Update active thumbnail
            thumbnailGallery.querySelectorAll('.thumbnail-item').forEach(item => {
                item.classList.remove('active');
            });
            this.classList.add('active');
            
            // Update main image
            mainImage.src = imageSrc;
        });
    });
}

// Image zoom functionality
function initializeImageZoom() {
    const mainImageContainer = document.querySelector('.main-image-container');
    const mainImage = document.getElementById('mainProductImage');
    const zoomOverlay = document.getElementById('imageZoomOverlay');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    
    let currentZoom = 1;
    const maxZoom = 3;
    const minZoom = 1;
    const zoomStep = 0.5;
    
    // Toggle zoom overlay
    mainImageContainer.addEventListener('click', function() {
        if (zoomOverlay.classList.contains('active')) {
            closeZoom();
        } else {
            openZoom();
        }
    });
    
    // Zoom controls
    zoomInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            updateZoom();
        }
    });
    
    zoomOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            updateZoom();
        }
    });
    
    resetZoomBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentZoom = 1;
        updateZoom();
    });
    
    // Close zoom when clicking outside
    zoomOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            closeZoom();
        }
    });
    
    function openZoom() {
        zoomOverlay.classList.add('active');
        mainImageContainer.style.cursor = 'zoom-out';
        updateZoom();
    }
    
    function closeZoom() {
        zoomOverlay.classList.remove('active');
        mainImageContainer.style.cursor = 'zoom-in';
        currentZoom = 1;
        updateZoom();
    }
    
    function updateZoom() {
        mainImage.style.transform = `scale(${currentZoom})`;
        
        // Update button states
        zoomInBtn.disabled = currentZoom >= maxZoom;
        zoomOutBtn.disabled = currentZoom <= minZoom;
        
        // Update cursor
        if (currentZoom > 1) {
            mainImage.style.cursor = 'grab';
        } else {
            mainImage.style.cursor = 'zoom-in';
        }
    }
    
    // Pan functionality when zoomed
    let isPanning = false;
    let startX, startY, translateX = 0, translateY = 0;
    
    mainImage.addEventListener('mousedown', function(e) {
        if (currentZoom > 1) {
            isPanning = true;
            startX = e.clientX - translateX;
            startY = e.clientY - translateY;
            mainImage.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isPanning && currentZoom > 1) {
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            mainImage.style.transform = `scale(${currentZoom}) translate(${translateX / currentZoom}px, ${translateY / currentZoom}px)`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isPanning) {
            isPanning = false;
            mainImage.style.cursor = 'grab';
        }
    });
}

// Smooth scroll for product grid
function smoothScrollToProduct(productCard) {
    productCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('loading');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

// Contact button functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactButtons = document.querySelectorAll('.contact-btn-primary');
    
    contactButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Scroll to contact section or open contact modal
            const contactSection = document.getElementById('contacto');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Fallback: show alert or redirect
                alert('Para más información, contáctanos al +52 (667) 123-4567');
            }
        });
    });
});

// Download button functionality
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            // In a real implementation, this would download a PDF
            alert('Descarga de ficha técnica no disponible en esta versión de demostración');
        });
    });
});

// Keyboard navigation for modal
document.addEventListener('keydown', function(e) {
    const modal = document.getElementById('productModal');
    if (!modal.classList.contains('active')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            // Previous image
            const activeThumbnail = document.querySelector('.thumbnail-item.active');
            const prevThumbnail = activeThumbnail?.previousElementSibling;
            if (prevThumbnail) {
                prevThumbnail.click();
            }
            break;
        case 'ArrowRight':
            // Next image
            const activeThumbnailNext = document.querySelector('.thumbnail-item.active');
            const nextThumbnail = activeThumbnailNext?.nextElementSibling;
            if (nextThumbnail) {
                nextThumbnail.click();
            }
            break;
    }
});

// Performance optimization: Debounce scroll events
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

// Add smooth transitions to all interactive elements
document.addEventListener('DOMContentLoaded', function() {
    const interactiveElements = document.querySelectorAll('button, .product-card, .filter-btn, .thumbnail-item');
    
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
});


