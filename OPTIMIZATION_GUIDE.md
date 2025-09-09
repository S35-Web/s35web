# Guía de Optimización de Imágenes

## Problema Actual
Las imágenes PNG en `Assets/productos_background/` son muy pesadas (8-12MB cada una), causando lentitud en la carga.

## Soluciones Implementadas

### 1. Lazy Loading
- ✅ Imágenes se cargan solo cuando son visibles
- ✅ Primera fila se carga inmediatamente (eager loading)
- ✅ Resto de imágenes se cargan progresivamente

### 2. Fallback a JPG
- ✅ Si una imagen PNG falla, automáticamente usa la versión JPG
- ✅ Las imágenes JPG son más ligeras (6-8MB vs 8-12MB)

### 3. Estados de Carga
- ✅ Opacidad reducida mientras cargan
- ✅ Blur sutil durante la carga
- ✅ Transición suave al cargar

### 4. Caché Optimizado
- ✅ Headers de caché para imágenes estáticas
- ✅ Caché de 1 año para assets

## Optimizaciones Recomendadas

### Opción 1: Comprimir PNGs Existentes
```bash
# Usar herramientas online como:
# - TinyPNG.com
# - Compressor.io
# - Squoosh.app

# Reducir calidad a 80-85%
# Reducir resolución si es necesario
```

### Opción 2: Convertir a WebP
```bash
# WebP es 25-35% más ligero que PNG
# Mantiene transparencia
# Mejor compresión
```

### Opción 3: Crear Versiones Múltiples
```bash
# Crear 3 versiones:
# - thumbnail: 200x200px (para preview)
# - medium: 400x400px (para background)
# - full: 800x800px (para zoom)
```

## Herramientas Recomendadas

### Online (Gratis)
1. **TinyPNG** - https://tinypng.com/
2. **Squoosh** - https://squoosh.app/
3. **Compressor.io** - https://compressor.io/

### Desktop
1. **ImageOptim** (Mac)
2. **RIOT** (Windows)
3. **GIMP** (Multiplataforma)

## Resultado Esperado
- **Tiempo de carga**: Reducido de 30-60s a 5-10s
- **Tamaño total**: De ~150MB a ~30-50MB
- **Experiencia**: Carga progresiva y suave

## Implementación
Una vez optimizadas las imágenes, reemplazar en:
`Assets/productos_background/`

El sistema automáticamente detectará y usará las nuevas imágenes optimizadas.
