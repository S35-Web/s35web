# 🚀 S-35 Technology - Desarrollo Local

## 🚨 **Problema Resuelto**

**No podías acceder al Panel de Control PDC porque estabas ejecutando el proyecto localmente** (abriendo archivos HTML directamente en el navegador), pero las APIs están configuradas para funcionar en Vercel (producción).

## ✅ **Solución Implementada**

He creado un **servidor local completo** que incluye todas las APIs necesarias para que el proyecto funcione en desarrollo local.

## 🚀 **Inicio Rápido**

### **Opción 1: Script Automático (Recomendado)**
```bash
# Ejecuta este comando en la terminal
./start-local.sh
```

### **Opción 2: Comando Manual**
```bash
# Si tienes Node.js instalado
node server-local.js
```

## 📋 **Requisitos**

### **Si NO tienes Node.js:**
1. Ve a https://nodejs.org/
2. Descarga e instala Node.js (versión LTS)
3. Reinicia tu terminal
4. Ejecuta `./start-local.sh`

### **Si ya tienes Node.js:**
1. Ejecuta `./start-local.sh`
2. ¡Listo!

## 🌐 **URLs Disponibles**

Una vez que ejecutes el servidor local:

- **🏠 Sitio Principal:** http://localhost:3000/
- **🔧 Panel de Control PDC:** http://localhost:3000/pdc-login.html
- **🔍 Debug PDC:** http://localhost:3000/debug-pdc.html
- **🛒 Punto de Venta POS:** http://localhost:3000/pos-login.html
- **👥 Panel de Clientes:** http://localhost:3000/client-login.html

## 🔑 **Credenciales de Prueba**

| Panel | Usuario | Contraseña | Descripción |
|-------|---------|------------|-------------|
| **PDC** | admin | admin123 | Panel de Control Principal |
| **POS** | ventas1 | ventas123 | Punto de Venta |
| **Cliente** | cliente1 | cliente123 | Panel de Clientes |
| **Colaborador** | colaborador1 | colab123 | Panel de Colaboradores |

## 🔧 **Características del Servidor Local**

### **APIs Incluidas:**
- ✅ `/api/login` - Autenticación de usuarios
- ✅ `/api/products` - Lista de productos S-35
- ✅ `/api/health` - Estado del servidor
- ✅ CORS habilitado para desarrollo
- ✅ JWT tokens (versión simplificada)

### **Productos de Ejemplo:**
- Basecoat Blanco Absoluto - $450
- Estuco Base Pro+ - $380
- Y más productos S-35...

### **Funcionalidades:**
- ✅ Servidor de archivos estáticos
- ✅ APIs RESTful funcionales
- ✅ Logs de debug en consola
- ✅ Manejo de errores
- ✅ Respuestas JSON estructuradas

## 🚨 **Solución de Problemas**

### **Error: "node: command not found"**
- **Solución:** Instala Node.js desde https://nodejs.org/

### **Error: "Port 3000 is already in use"**
- **Solución:** El script automáticamente libera el puerto 3000

### **Error: "Cannot find module"**
- **Solución:** Asegúrate de estar en la carpeta correcta del proyecto

### **El Panel de Control no carga**
- **Solución:** Usa http://localhost:3000/pdc-login.html (no abrir archivos directamente)

## 📁 **Archivos Creados**

1. **`server-local.js`** - Servidor local completo
2. **`start-local.sh`** - Script de inicio automático
3. **`debug-pdc.html`** - Herramienta de diagnóstico
4. **`DESARROLLO_LOCAL.md`** - Instrucciones detalladas

## 🎯 **Próximos Pasos**

1. **Ejecuta el servidor local:** `./start-local.sh`
2. **Accede al PDC:** http://localhost:3000/pdc-login.html
3. **Login con:** admin / admin123
4. **¡Disfruta del Panel de Control!** 🎉

## 🔄 **Para Producción**

Cuando quieras desplegar en producción:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desplegar
vercel --prod
```

---

**¡Ahora puedes desarrollar localmente con todas las funcionalidades del sistema ERP S-35!** 🚀


