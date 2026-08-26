// server-local-simple.js - Servidor local simplificado para sitio web principal
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Función para servir archivos estáticos
function serveStaticFile(req, res, filePath) {
    try {
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Archivo no encontrado</h1>');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.mp4': 'video/mp4',
            '.webm': 'video/webm',
            '.avif': 'image/avif',
            '.glb': 'model/gltf-binary',
            '.obj': 'text/plain'
        };

        const contentType = mimeTypes[ext] || 'application/octet-stream';

        // Leer y servir el archivo
        const fileContent = fs.readFileSync(filePath);
        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.end(fileContent);
    } catch (error) {
        console.error('Error sirviendo archivo:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Error interno del servidor</h1>');
    }
}

// Función para manejar directorios
function serveDirectory(req, res, dirPath) {
    const indexPath = path.join(dirPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        serveStaticFile(req, res, indexPath);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Directorio no encontrado</h1>');
    }
}

// Crear servidor
const server = http.createServer((req, res) => {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    console.log(`${req.method} ${pathname}`);

    // API de salud
    if (pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            success: true, 
            message: 'Servidor local funcionando',
            timestamp: new Date().toISOString()
        }));
        return;
    }

    // API de contacto (para el formulario)
    if (req.method === 'POST' && pathname === '/api/contact') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const contactData = JSON.parse(body);
                console.log('Datos de contacto recibidos:', contactData);
                
                // Simular guardado e envío exitoso
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    ok: true, 
                    message: 'Mensaje enviado correctamente' 
                }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    ok: false, 
                    error: 'Error al procesar el mensaje' 
                }));
            }
        });
        return;
    }

    // API de login (simulada)
    if (req.method === 'POST' && pathname === '/api/login') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { password } = JSON.parse(body || '{}');
                const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
                if (password !== adminPass) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'Credenciales inválidas' }));
                    return;
                }
                // Token simulado (no validar en local)
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, token: 'local-dev-token' }));
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: 'Solicitud inválida' }));
            }
        });
        return;
    }

    // API de mensajes (simulada)
    if (pathname === '/api/messages') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, items: [] }));
            return;
        }
        if (req.method === 'DELETE') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
            return;
        }
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
        return;
    }

    // Servir archivos estáticos
    let filePath;
    
    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (pathname.startsWith('/Assets/')) {
        // Manejar archivos de Assets
        const assetPath = pathname.substring(1); // Remover la barra inicial
        filePath = path.join(__dirname, 'public', assetPath);
    } else {
        // Otros archivos
        filePath = path.join(__dirname, 'public', pathname);
    }

    // Verificar si es un archivo o directorio
    try {
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            serveDirectory(req, res, filePath);
        } else {
            serveStaticFile(req, res, filePath);
        }
    } catch (error) {
        const htmlFallback = filePath + '.html';
        if (!path.extname(filePath) && fs.existsSync(htmlFallback)) {
            serveStaticFile(req, res, htmlFallback);
            return;
        }
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - Archivo no encontrado</h1>');
    }
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log('🚀 Servidor local simplificado ejecutándose en http://localhost:3000');
    console.log('🏠 Sitio Principal: http://localhost:3000/');
    console.log('📋 Funcionalidades:');
    console.log('   ✅ Página principal completa');
    console.log('   ✅ Catálogo de productos');
    console.log('   ✅ Formulario de contacto');
    console.log('   ✅ Enlaces externos configurados');
    console.log('⏹️  Presiona Ctrl+C para detener el servidor');
});

// Manejo de errores
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Puerto ${PORT} ya está en uso. Intenta con otro puerto.`);
    } else {
        console.error('❌ Error del servidor:', err);
    }
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
    console.log('\n⏹️  Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado exitosamente');
        process.exit(0);
    });
});
