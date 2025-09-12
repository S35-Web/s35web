# S-35 Technology - Sitio Web

Sitio web oficial de S-35 Technology - Tecnología en construcción.

## 🚀 Despliegue en Vercel

Este proyecto está configurado para desplegarse automáticamente en Vercel.

### Configuración de Vercel
- **Framework**: Static Site
- **Build Command**: No requerido
- **Output Directory**: `/` (raíz)
- **Node Version**: 14.x o superior

### Archivos principales
- `index.html` - Página principal
- `catalogo.html` - Catálogo de productos
- `conoce-mas.html` - Página informativa
- `styles.css` - Estilos principales
- `script.js` - JavaScript principal

### Assets
- `Assets/` - Imágenes, videos y recursos
- `Assets/productos_background/` - Imágenes de productos
- `Assets/productos_background_optimized/` - Imágenes optimizadas

## 🚀 Características

- **Diseño Responsive**: Se adapta perfectamente a dispositivos móviles, tablets y escritorio
- **Navegación Intuitiva**: Menú de navegación fijo con scroll suave
- **Catálogo Interactivo**: Filtros por categoría y vista detallada de productos
- **Formulario de Contacto**: Sistema de contacto funcional con validación
- **Animaciones Suaves**: Efectos visuales modernos y profesionales
- **Optimización SEO**: Estructura semántica y meta tags optimizados

## 📁 Estructura del Proyecto

```
S35 Web cursor project/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Funcionalidades JavaScript
└── README.md           # Documentación
```

## 🎨 Secciones de la Página

### 1. Header y Navegación
- Logo S-35
- Menú de navegación responsive
- Navegación fija con efecto scroll

### 2. Hero Section
- Título principal impactante
- Descripción de la empresa
- Botones de llamada a la acción
- Diseño visual atractivo

### 3. Productos Destacados
- Grid de productos principales
- Tarjetas con información clave
- Efectos hover interactivos

### 4. Catálogo Completo
- Sistema de filtros por categoría
- Grid dinámico de productos
- Modal de detalles de producto
- Integración con formulario de contacto

### 5. Servicios
- Grid de servicios ofrecidos
- Iconos representativos
- Información clara y concisa

### 6. Contacto
- Información de contacto
- Formulario funcional
- Validación de campos
- Notificaciones de estado

### 7. Footer
- Enlaces rápidos
- Redes sociales
- Información de copyright

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con variables CSS y Grid/Flexbox
- **JavaScript ES6+**: Funcionalidades interactivas
- **Font Awesome**: Iconografía
- **Google Fonts**: Tipografía Inter

## 📱 Responsive Design

La página está optimizada para:
- **Móviles**: 320px - 768px
- **Tablets**: 768px - 1024px
- **Escritorio**: 1024px+

## 🎯 Funcionalidades JavaScript

### Navegación
- Menú hamburguesa para móviles
- Scroll suave entre secciones
- Navegación fija con efecto parallax

### Catálogo de Productos
- Filtrado dinámico por categorías
- Modal de detalles de producto
- Integración con formulario de contacto

### Formulario de Contacto
- Validación en tiempo real
- Notificaciones de estado
- Pre-llenado automático desde productos

### Animaciones
- Intersection Observer para animaciones al scroll
- Efectos hover en tarjetas
- Transiciones suaves

## 🚀 Cómo Usar

1. **Abrir la página**: Simplemente abre `index.html` en tu navegador
2. **Navegar**: Usa el menú superior para moverte entre secciones
3. **Explorar productos**: Filtra por categoría en el catálogo
4. **Contactar**: Completa el formulario de contacto para consultas

## 🎨 Personalización

### Colores
Los colores se definen en variables CSS en `styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --primary-dark: #1d4ed8;
    --secondary-color: #64748b;
    --accent-color: #f59e0b;
    /* ... más variables */
}
```

### Productos
Para añadir o modificar productos, edita el array `productos` en `script.js`:
```javascript
const productos = [
    {
        id: 1,
        nombre: "Nombre del Producto",
        descripcion: "Descripción del producto",
        precio: "$XXX",
        categoria: "categoria",
        imagen: "icono"
    }
    // ... más productos
];
```

## 📞 Información de Contacto

- **Empresa**: S-35 Productos
- **Dirección**: Av. Industrial 123, Zona Industrial
- **Teléfono**: +1 (555) 123-4567
- **Email**: info@s35productos.com

## 🔧 Próximas Mejoras

- [ ] Integración con backend para formulario de contacto
- [ ] Sistema de carrito de compras
- [ ] Galería de imágenes para productos
- [ ] Blog de noticias
- [ ] Sistema de búsqueda avanzada
- [ ] Integración con redes sociales
- [ ] Optimización de rendimiento
- [ ] PWA (Progressive Web App)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE para más detalles.

---

**Desarrollado con ❤️ para S-35 Productos**
