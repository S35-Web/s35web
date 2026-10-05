#!/bin/bash

# start-local.sh - Script para iniciar el servidor local S-35

echo "🚀 Iniciando Servidor Local S-35 Technology"
echo "=============================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📥 Por favor instala Node.js desde: https://nodejs.org/"
    echo "🔄 Después de instalar, ejecuta este script nuevamente"
    exit 1
fi

# Mostrar versión de Node.js
echo "✅ Node.js instalado: $(node --version)"

# Verificar si el archivo server-local-simple.js existe
if [ ! -f "server-local-simple.js" ]; then
    echo "❌ Archivo server-local-simple.js no encontrado"
    echo "📁 Asegúrate de estar en la carpeta correcta del proyecto"
    exit 1
fi

# Verificar si el puerto 3000 está ocupado
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Puerto 3000 está ocupado"
    echo "🔄 Intentando detener procesos en el puerto 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Mostrar información del servidor
echo ""
echo "🌐 URLs disponibles:"
echo "   🏠 Sitio Principal: http://localhost:3000/"
echo "   📋 Catálogo: http://localhost:3000/catalogo.html"
echo "   📞 Contacto: http://localhost:3000/#contacto"
echo ""
echo "🔗 Enlaces externos configurados:"
echo "   👥 Colaboradores: https://tu-web-externa.com/colaboradores"
echo "   💰 POS: https://tu-web-externa.com/pos"
echo "   ⚙️  PDC: https://tu-web-externa.com/pdc"
echo ""
echo "⏹️  Presiona Ctrl+C para detener el servidor"
echo "=============================================="
echo ""

# Iniciar el servidor
node server-local-simple.js


