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
    },
    'waxtard-perla': {
        name: 'Waxtard Perla',
        category: 'Acabados',
        description: 'Estuco decorativo fino de acabado satinado en tono perla. Formulado para proporcionar elegancia y protección duradera. Disponible en presentación de 20 kg.',
        features: [
            'Acabado satinado perla elegante',
            'Textura suave al tacto',
            'Resistencia a la intemperie',
            'Fácil aplicación',
            'Presentación en saco de 20 kg'
        ],
        applications: [
            'Acabados decorativos interiores',
            'Espacios residenciales premium',
            'Proyectos arquitectónicos de alta gama',
            'Renovación de interiores',
            'Aplicaciones donde la estética es prioritaria'
        ],
        images: [
            'Assets/productos_background/WAXTARD-blanco-perla.png',
            'Assets/productos_background/WAXTARD-blanco-perla.png',
            'Assets/productos_background/WAXTARD-blanco-perla.png'
        ]
    },
    'waxtard-gris': {
        name: 'Waxtard Gris',
        category: 'Acabados',
        description: 'Estuco decorativo fino de acabado satinado en tono gris. Ideal para proyectos contemporáneos que requieren acabados modernos y sofisticados con durabilidad excepcional.',
        features: [
            'Acabado satinado en tono gris',
            'Aspecto contemporáneo',
            'Resistencia a la intemperie',
            'Textura uniforme',
            'Fácil mantenimiento'
        ],
        applications: [
            'Interiores modernos',
            'Arquitectura contemporánea',
            'Espacios comerciales de diseño',
            'Proyectos minimalistas',
            'Acabados arquitectónicos de vanguardia'
        ],
        images: [
            'Assets/productos_background/WAXTARD-gris.png',
            'Assets/productos_imagenes/waxtrard-gris.jpg',
            'Assets/productos_background/WAXTARD-gris.png'
        ]
    },
    'basecoat-gris': {
        name: 'Basecoat Gris',
        category: 'Basecoat',
        description: 'Base de aplicación de alta calidad en color gris, formulada para proporcionar una superficie uniforme y preparada para la aplicación de acabados finales. Excelente adherencia y resistencia.',
        features: [
            'Color gris estable',
            'Excelente poder cubriente',
            'Compatible con múltiples acabados',
            'Resistencia a la alcalinidad',
            'Base ideal para tonos oscuros'
        ],
        applications: [
            'Sistemas de revestimiento arquitectónico',
            'Base para acabados grises y oscuros',
            'Proyectos comerciales e industriales',
            'Renovación de fachadas',
            'Aplicaciones exteriores exigentes'
        ],
        images: [
            'Assets/productos_background/basecoat.png',
            'Assets/productos_imagenes/BASECOAT-GRIS-Recuperado.jpg',
            'Assets/productos_background/basecoat.png'
        ]
    }
};

const productDataEn = {
    'estuco-base': {
        category: 'Stucco',
        description: 'Advanced base stucco formula designed to provide a solid, uniform base in coating systems. Developed with cutting-edge technology for exceptional adhesion and long-term durability.',
        features: ['Superior adhesion on multiple substrates', 'Extended working time for easier application', 'Weather and UV resistance', 'Easy application with conventional tools', 'Fast, uniform drying'],
        applications: ['Residential exterior coatings', 'Commercial and industrial buildings', 'Renovation of existing facades', 'Thermal insulation systems', 'Heritage restoration projects']
    },
    'basecoat-blanco': {
        category: 'Basecoat',
        description: 'High-quality white application base formulated for a uniform surface ready for final finishes. Ideal for projects requiring maximum reflectivity and flawless results.',
        features: ['Pure, stable white color', 'Excellent coverage', 'Compatible with multiple finishes', 'Alkali resistance', 'Single-coat application'],
        applications: ['Architectural coating systems', 'Commercial building facades', 'High-visibility projects', 'Public space renovation', 'Special decorative applications']
    },
    'waxtard-blanco': {
        category: 'Finishes',
        description: 'Premium final finish in absolute white, designed for lasting protection and exceptional aesthetics. Formulated with advanced technology to withstand the most demanding conditions.',
        features: ['Absolute white with maximum reflectivity', 'Superior weather resistance', 'UV protection', 'Easy cleaning and maintenance', 'Uniform, professional finish'],
        applications: ['High-end final finishes', 'Institutional buildings', 'Contemporary architecture projects', 'Historic monument renovation', 'Applications where aesthetics are critical']
    },
    'ultraforce': {
        category: 'Adhesives',
        description: 'Ultra high-strength adhesive for critical structural applications. Formulated with next-generation polymers for exceptionally strong, durable bonds.',
        features: ['Exceptional bond strength', 'Application in adverse conditions', 'Optimized curing time', 'Compatible with multiple materials', 'Superior chemical resistance'],
        applications: ['Critical structural joints', 'High-strength repairs', 'Industrial applications', 'Infrastructure projects', 'High mechanical demand situations']
    },
    'cellbond': {
        category: 'Adhesives',
        description: 'Specialized adhesive for cellular and porous bonds. Formulated to penetrate and create solid bonds in low-density materials.',
        features: ['Deep penetration in porous materials', 'Superior adhesion on irregular surfaces', 'Extended working time', 'Moisture resistance', 'Versatile application'],
        applications: ['Bonding cellular materials', 'Repair of porous surfaces', 'Foam and insulation applications', 'Restoration projects', 'Low-density material joints']
    },
    'styrobond': {
        category: 'Adhesives',
        description: 'Specialized adhesive for expanded polystyrene (EPS) and similar materials. Creates strong bonds without damaging the base material.',
        features: ['Compatible with expanded polystyrene', 'Does not damage base material', 'Exceptional adhesion', 'Thermal resistance', 'Clean, controlled application'],
        applications: ['Thermal insulation systems', 'EPS panel bonding', 'Green building applications', 'Energy efficiency projects', 'Ventilated facade systems']
    },
    'mixandready': {
        category: 'Stucco',
        description: 'Ready-to-use pre-mixed stucco designed to simplify application. Just add water for a perfect mix with guaranteed consistency and quality.',
        features: ['Pre-mixed, just add water', 'Guaranteed consistency', 'Easy application', 'Optimized working time', 'Uniform quality in every batch'],
        applications: ['Residential applications', 'Quick renovation projects', 'Maintenance work', 'Small job site applications', 'Projects where simplicity is key']
    },
    'porcelanico': {
        category: 'Finishes',
        description: 'Universal porcelain finish designed for exceptional durability and superior aesthetics. Compatible with multiple substrates and application conditions.',
        features: ['Universal application', 'Exceptional durability', 'Superior chemical resistance', 'Uniform, professional finish', 'Easy maintenance'],
        applications: ['High-durability finishes', 'Industrial applications', 'High-traffic spaces', 'Commercial projects', 'Applications where durability is critical']
    },
    'cemento-plastico': {
        category: 'Adhesives',
        description: 'High-flexibility cement for applications requiring movement and adaptability. Maintains adhesive properties under tension and deformation.',
        features: ['High flexibility', 'Deformation resistance', 'Adhesion under movement conditions', 'Long-term durability', 'Versatile application'],
        applications: ['Expansion joints', 'Applications with movement', 'Crack repair', 'Flexible joints', 'Projects requiring adaptability']
    },
    'piso-sobre-piso': {
        category: 'Finishes',
        description: 'Finish system designed specifically for application over existing floors. Provides a new, durable surface without removing the original floor.',
        features: ['Application over existing floors', 'Exceptional adhesion', 'Smooth, uniform surface', 'Wear resistance', 'Fast, efficient installation'],
        applications: ['Renovation of existing floors', 'Remodeling projects', 'Commercial applications', 'High-traffic spaces', 'Restoration projects']
    },
    'pastablock': {
        category: 'Stucco',
        description: 'Specialized stucco for concrete blocks and masonry. Provides exceptional adhesion and uniform finish on masonry surfaces.',
        features: ['Superior masonry adhesion', 'Efficient joint filling', 'Uniform finish', 'Weather resistance', 'Economical application'],
        applications: ['Block masonry', 'Traditional construction', 'Residential projects', 'Existing wall renovation', 'Rural construction applications']
    },
    'ceramico': {
        category: 'Finishes',
        description: 'High-quality ceramic finish for exceptional durability and superior aesthetics. Ideal where chemical and mechanical resistance is required.',
        features: ['Superior chemical resistance', 'Exceptional durability', 'Authentic ceramic finish', 'Easy cleaning and maintenance', 'Abrasion resistance'],
        applications: ['Industrial applications', 'High-demand spaces', 'Commercial projects', 'Chemical exposure applications', 'Applications where durability is critical']
    },
    'waxtard-perla': {
        category: 'Finishes',
        description: 'Fine decorative stucco with pearl satin finish. Formulated to provide elegance and lasting protection. Available in 20 kg presentation.',
        features: ['Elegant pearl satin finish', 'Smooth texture', 'Weather resistance', 'Easy application', '20 kg bag presentation'],
        applications: ['Interior decorative finishes', 'Premium residential spaces', 'High-end architectural projects', 'Interior renovation', 'Applications where aesthetics are a priority']
    },
    'waxtard-gris': {
        category: 'Finishes',
        description: 'Fine decorative stucco with gray satin finish. Ideal for contemporary projects requiring modern, sophisticated finishes with exceptional durability.',
        features: ['Gray satin finish', 'Contemporary appearance', 'Weather resistance', 'Uniform texture', 'Easy maintenance'],
        applications: ['Modern interiors', 'Contemporary architecture', 'Designer commercial spaces', 'Minimalist projects', 'Cutting-edge architectural finishes']
    },
    'basecoat-gris': {
        category: 'Basecoat',
        description: 'High-quality gray application base formulated for a uniform surface ready for final finishes. Excellent adhesion and resistance.',
        features: ['Stable gray color', 'Excellent coverage', 'Compatible with multiple finishes', 'Alkali resistance', 'Ideal base for dark tones'],
        applications: ['Architectural coating systems', 'Base for gray and dark finishes', 'Commercial and industrial projects', 'Facade renovation', 'Demanding exterior applications']
    }
};

function getCatalogLang() {
    return window.S35_I18N?.getLanguage() || 'es';
}

function getLocalizedProduct(productId) {
    const base = productData[productId];
    if (!base) return null;
    if (getCatalogLang() === 'es') return base;
    const en = productDataEn[productId];
    if (!en) return base;
    return { ...base, ...en };
}

let activeModalProductId = null;

// Initialize catalog functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    initializeProductCards();
    initializeModal();
    initializeImageZoom();
});

document.addEventListener('s35:languagechange', function() {
    const modal = document.getElementById('productModal');
    if (activeModalProductId && modal && modal.classList.contains('active')) {
        openProductModal(activeModalProductId);
    }
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
        activeModalProductId = null;
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
    activeModalProductId = productId;
    const product = getLocalizedProduct(productId);
    
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
            window.location.href = 'index.html#contacto';
        });
    });
});

// Download button functionality
document.addEventListener('DOMContentLoaded', function() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contactSection = document.getElementById('contacto');
            if (!contactSection) {
                window.location.href = 'index.html#contacto';
            } else {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                const messageField = document.getElementById('mensaje') || document.getElementById('mensaje-mobile');
                if (messageField) {
                    messageField.focus();
                    if (getCatalogLang() === 'es') {
                        messageField.placeholder = 'Me gustaría solicitar la ficha técnica del producto...';
                    } else {
                        messageField.placeholder = 'I would like to request the technical sheet for this product...';
                    }
                }
            }
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


