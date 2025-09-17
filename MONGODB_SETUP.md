# 🗄️ **CONFIGURACIÓN DE MONGODB ATLAS**

## **PASO 1: CREAR CUENTA EN MONGODB ATLAS**

1. Ve a https://www.mongodb.com/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (gratuito)

## **PASO 2: CONFIGURAR CLUSTER**

1. **Selecciona región:** Elige la más cercana a México (us-east-1 o us-west-2)
2. **Tipo de cluster:** M0 Sandbox (gratuito)
3. **Nombre del cluster:** `s35-erp-cluster`

## **PASO 3: CONFIGURAR ACCESO**

### **3.1 Crear usuario de base de datos:**
- **Username:** `s35-admin`
- **Password:** Genera una contraseña segura (guárdala)
- **Privileges:** Read and write to any database

### **3.2 Configurar IP Whitelist:**
- **Opción 1:** Agregar `0.0.0.0/0` (acceso desde cualquier IP)
- **Opción 2:** Agregar IP específica de Vercel

## **PASO 4: OBTENER STRING DE CONEXIÓN**

1. Ve a **Database** → **Connect**
2. Selecciona **Connect your application**
3. **Driver:** Node.js
4. **Version:** 4.1 or later
5. Copia el string de conexión

### **String de conexión será algo como:**
```
mongodb+srv://s35-admin:<password>@s35-erp-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## **PASO 5: CONFIGURAR EN VERCEL**

### **5.1 Agregar variable de entorno:**
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. **Name:** `MONGODB_URI`
4. **Value:** El string de conexión completo
5. **Environment:** Production, Preview, Development
6. **Save**

### **5.2 Verificar configuración:**
- El `vercel.json` ya está configurado para usar `@mongodb_uri`
- No necesitas cambiar nada en el código

## **PASO 6: POBLAR BASE DE DATOS**

### **6.1 Después del despliegue:**
1. Ve a tu sitio desplegado
2. Accede a: `https://tu-sitio.vercel.app/api/seed-database`
3. Esto creará las colecciones y datos iniciales

### **6.2 Verificar datos:**
- **Productos:** 10 productos S-35
- **Clientes:** 3 clientes de ejemplo
- **Usuarios:** 3 usuarios de prueba

## **PASO 7: CREDENCIALES DE PRUEBA**

### **Usuarios creados:**
- **PDC:** `admin` / `admin123`
- **POS:** `ventas1` / `ventas123`
- **Cliente:** `cliente1` / `cliente123`

## **PASO 8: VERIFICAR FUNCIONAMIENTO**

### **8.1 Probar APIs:**
- `GET /api/products` - Listar productos
- `GET /api/clients` - Listar clientes
- `GET /api/orders/stats` - Estadísticas

### **8.2 Probar Dashboards:**
- **PDC:** Login con `admin` / `admin123`
- **POS:** Login con `ventas1` / `ventas123`
- **Cliente:** Login con `cliente1` / `cliente123`

## **TROUBLESHOOTING**

### **Error de conexión:**
- Verifica que `MONGODB_URI` esté configurada en Vercel
- Verifica que el usuario tenga permisos de lectura/escritura
- Verifica que la IP esté en la whitelist

### **Error de autenticación:**
- Verifica que el username y password sean correctos
- Verifica que el usuario tenga los permisos necesarios

### **Error de red:**
- Verifica que el cluster esté activo
- Verifica que la región sea la correcta
- Verifica que no haya restricciones de red

## **COSTOS**

### **Plan gratuito M0:**
- **Storage:** 512 MB
- **Connections:** 100 concurrent
- **Bandwidth:** 1 GB/month
- **Costo:** $0/mes

### **Para producción:**
- Considera upgrade a M2 o M5
- Monitorea el uso de recursos
- Configura alertas de límites

## **SEGURIDAD**

### **Recomendaciones:**
1. **Usa contraseñas fuertes** para usuarios de DB
2. **Restringe IPs** en producción
3. **Habilita autenticación** en todas las colecciones
4. **Configura backup** automático
5. **Monitorea accesos** sospechosos

## **SOPORTE**

### **Si tienes problemas:**
1. Revisa los logs de Vercel
2. Verifica la configuración de MongoDB Atlas
3. Consulta la documentación de MongoDB
4. Contacta al equipo de desarrollo

---

**¡Listo! Tu base de datos MongoDB estará funcionando en minutos.**
