// Script de migración para reemplazar APIs con MongoDB
const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando migración a MongoDB...');

// Reemplazar products.js con la versión MongoDB
try {
    const oldProductsPath = path.join(__dirname, 'api', 'products.js');
    const newProductsPath = path.join(__dirname, 'api', 'products-mongodb.js');
    
    if (fs.existsSync(newProductsPath)) {
        // Hacer backup de la versión antigua
        fs.copyFileSync(oldProductsPath, path.join(__dirname, 'api', 'products-backup.js'));
        console.log('✅ Backup de products.js creado');
        
        // Reemplazar con la versión MongoDB
        fs.copyFileSync(newProductsPath, oldProductsPath);
        console.log('✅ products.js actualizado con MongoDB');
        
        // Eliminar archivo temporal
        fs.unlinkSync(newProductsPath);
        console.log('✅ Archivo temporal eliminado');
    }
} catch (error) {
    console.error('❌ Error migrando products.js:', error.message);
}

// Crear archivo de instrucciones de configuración
const instructions = `
# 🚀 CONFIGURACIÓN DE MONGODB PARA S-35 ERP

## 1. Crear cuenta en MongoDB Atlas
1. Ve a https://www.mongodb.com/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster
4. Configura el acceso a la base de datos

## 2. Obtener la cadena de conexión
1. En MongoDB Atlas, ve a "Connect"
2. Selecciona "Connect your application"
3. Copia la cadena de conexión
4. Reemplaza <password> con tu contraseña

## 3. Configurar variables de entorno en Vercel
1. Ve a tu proyecto en Vercel
2. Ve a Settings > Environment Variables
3. Agrega las siguientes variables:
   - MONGODB_URI: tu_cadena_de_conexion_mongodb
   - JWT_SECRET: s35-admin-secret-key-2024
   - RESEND_API_KEY: tu_api_key_de_resend
   - MAIL_TO: contacto@s35.com.mx
   - MAIL_FROM: noreply@s35.com.mx

## 4. Desplegar
1. Haz commit de los cambios
2. Push a tu repositorio
3. Vercel desplegará automáticamente

## 5. Verificar funcionamiento
1. Ve a tu sitio desplegado
2. Prueba el login en cada panel
3. Verifica que los datos se guarden en MongoDB

## 📊 Estructura de la base de datos
- **products**: Catálogo de productos
- **orders**: Pedidos y ventas
- **quotes**: Cotizaciones
- **clients**: Clientes
- **inventory**: Movimientos de inventario
- **notifications**: Notificaciones del sistema
- **settings**: Configuración de la empresa

## 🔧 Comandos útiles
- Verificar conexión: Revisa los logs de Vercel
- Resetear datos: Elimina las colecciones en MongoDB Atlas
- Backup: Exporta las colecciones desde MongoDB Atlas
`;

fs.writeFileSync(path.join(__dirname, 'MONGODB_SETUP.md'), instructions);
console.log('✅ Instrucciones de configuración creadas en MONGODB_SETUP.md');

console.log('🎉 Migración completada!');
console.log('📋 Sigue las instrucciones en MONGODB_SETUP.md para configurar MongoDB Atlas');
