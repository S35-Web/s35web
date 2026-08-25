// Catalog Page JavaScript

// Product data for legacy modal (empty - new catalog uses dedicated pages or WhatsApp only)
// Products with dedicated pages navigate directly: Waxtard Blanco Perla, Waxtard Extra Anclaje, Cemento Plástico Concreto Aparente
// Other products: WhatsApp contact button only, no modal with invented specs
const productData = {};

const productDataEn = {};

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
        // Skip cards that have a direct link to a product page (these should navigate directly)
        const hasDirectLink = card.querySelector('a.view-product-btn[href*="producto-"]');
        if (hasDirectLink) {
            return; // Let the link handle navigation
        }
        
        // Only open modal for products that have data
        card.addEventListener('click', function(e) {
            // Don't open modal if clicking on WhatsApp button
            if (e.target.closest('.whatsapp-btn')) {
                return;
            }
            
            const productId = this.getAttribute('data-product');
            // Only open modal if product data exists
            if (productData[productId]) {
                openProductModal(productId);
            }
        });
    });
}

// Modal functionality
function initializeModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.getElementById('modalClose');
    const backdrop = document.querySelector('.modal-backdrop');
    
    if (!modal) return; // Modal may not exist in new catalog
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        activeModalProductId = null;
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    
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
    if (!modal) return; // No modal in new catalog
    
    activeModalProductId = productId;
    const product = getLocalizedProduct(productId);
    
    if (!product) return;
    
    // Update modal content
    const titleEl = document.getElementById('productTitle');
    const categoryEl = document.getElementById('productCategory');
    const descEl = document.getElementById('productDescription');
    
    if (titleEl) titleEl.textContent = product.name;
    if (categoryEl) categoryEl.textContent = product.category;
    if (descEl) descEl.textContent = product.description;
    
    // Update features
    const featuresList = document.getElementById('productFeatures');
    if (featuresList && product.features) {
        featuresList.innerHTML = '';
        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
    }
    
    // Update applications
    const applicationsList = document.getElementById('productApplications');
    if (applicationsList && product.applications) {
        applicationsList.innerHTML = '';
        product.applications.forEach(application => {
            const li = document.createElement('li');
            li.textContent = application;
            applicationsList.appendChild(li);
        });
    }
    
    // Update images
    if (product.images) {
        updateProductImages(product.images);
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Update product images
function updateProductImages(images) {
    const mainImage = document.getElementById('mainProductImage');
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    
    if (!mainImage || !thumbnailGallery) return;
    
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
    
    if (!mainImageContainer || !mainImage || !zoomOverlay) return;
    
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
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentZoom < maxZoom) {
                currentZoom += zoomStep;
                updateZoom();
            }
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (currentZoom > minZoom) {
                currentZoom -= zoomStep;
                updateZoom();
            }
        });
    }
    
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            currentZoom = 1;
            updateZoom();
        });
    }
    
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
        if (zoomInBtn) zoomInBtn.disabled = currentZoom >= maxZoom;
        if (zoomOutBtn) zoomOutBtn.disabled = currentZoom <= minZoom;
        
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
    if (!modal || !modal.classList.contains('active')) return;
    
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
