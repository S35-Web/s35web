// server-local-simple.js - Servidor local simplificado para sitio web principal
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const jwt = require('jsonwebtoken');
const stateStore = require('./api/_lib/state-store');

const PORT = 3000;

// Estado del panel en la nube: usa MongoDB si hay MONGODB_URI; si no, un
// archivo local compartido por todos los navegadores que apunten a este server.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const USE_MONGO = !!process.env.MONGODB_URI;
let getDb = null;
if (USE_MONGO) {
    try { getDb = require('./api/_lib/mongo').getDb; }
    catch (e) { console.error('No se pudo cargar el cliente de MongoDB:', e.message); }
}
const STATE_FILE = path.join(__dirname, '.data', 'state-live.json');

function readStateFile() {
    try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) || {}; }
    catch (_) { return {}; }
}
function writeStateFile(obj) {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(obj));
}
function verifyPanelToken(req) {
    try {
        const auth = req.headers.authorization || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        if (!token) return null;
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.role !== 'admin' && payload.role !== 'ventas') return null;
        return payload;
    } catch (_) { return null; }
}

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
                const parsed = JSON.parse(body || '{}');
                const username = String(parsed.username || '').trim().toLowerCase();
                const password = String(parsed.password || '');
                const adminUser = String(process.env.ADMIN_USERNAME || 'admin').trim().toLowerCase();
                const adminPass = process.env.ADMIN_PASSWORD || 'villa2012';
                const ventasUser = String(process.env.VENTAS_USERNAME || 'ventas').trim().toLowerCase();
                const ventasPass = process.env.VENTAS_PASSWORD || 'ventas123';
                let role = null;
                let sub = null;
                if (username && password && username === adminUser && password === adminPass) {
                    role = 'admin';
                    sub = adminUser;
                } else if (username && password && username === ventasUser && password === ventasPass) {
                    role = 'ventas';
                    sub = ventasUser;
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'Credenciales inválidas' }));
                    return;
                }
                const displayName = sub.charAt(0).toUpperCase() + sub.slice(1);
                const token = jwt.sign({ role: role, sub: sub }, JWT_SECRET, { expiresIn: '8h' });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    token: token,
                    user: { id: sub, username: sub, name: displayName, role: role }
                }));
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

    // Clientes compartidos (archivo local, todos los navegadores del mismo host)
    if (pathname === '/api/clients') {
        const livePath = path.join(__dirname, '.data', 'clients-live.json');
        const seedPath = path.join(__dirname, 'public', 'colaboradores', 'data', 'clients-import.json');
        const ensureLive = () => {
            if (fs.existsSync(livePath)) {
                try {
                    const raw = JSON.parse(fs.readFileSync(livePath, 'utf8'));
                    if (raw && Array.isArray(raw.items) && raw.items.length) return raw;
                } catch (_) {}
            }
            let items = [];
            try {
                const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
                if (seed && Array.isArray(seed.items)) items = seed.items;
            } catch (_) {}
            const doc = { items: items, updatedAt: new Date().toISOString(), seededFromFile: true };
            fs.mkdirSync(path.dirname(livePath), { recursive: true });
            fs.writeFileSync(livePath, JSON.stringify(doc));
            return doc;
        };
        if (req.method === 'GET') {
            const doc = ensureLive();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                ok: true,
                items: doc.items || [],
                updatedAt: doc.updatedAt || null,
                seeded: !!doc.seededFromFile
            }));
            return;
        }
        if (req.method === 'PUT') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const parsed = JSON.parse(body || '{}');
                    const items = Array.isArray(parsed.items) ? parsed.items : null;
                    if (!items) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: false, error: 'Falta items[]' }));
                        return;
                    }
                    const doc = {
                        items: items,
                        updatedAt: new Date().toISOString(),
                        seededFromFile: false
                    };
                    fs.mkdirSync(path.dirname(livePath), { recursive: true });
                    fs.writeFileSync(livePath, JSON.stringify(doc));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, total: items.length, updatedAt: doc.updatedAt }));
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'Solicitud inválida' }));
                }
            });
            return;
        }
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
        return;
    }

    // Usage global del copiloto
    if (pathname === '/api/s35-usage') {
        if (req.method === 'GET') {
            try {
                const { getCopilotUsageSummary } = require('./lib/copilot-usage');
                getCopilotUsageSummary().then(function (summary) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(summary));
                }).catch(function (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: err.message || 'Error usage' }));
                });
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message || 'Error usage' }));
            }
            return;
        }
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
        return;
    }

    if (pathname === '/colaboradores' || pathname === '/colaboradores/') {
        serveStaticFile(req, res, path.join(__dirname, 'public', 'colaboradores', 'index.html'));
        return;
    }
    if (pathname === '/colaboradores/panel' || pathname === '/colaboradores/panel/') {
        serveStaticFile(req, res, path.join(__dirname, 'public', 'colaboradores', 'panel.html'));
        return;
    }
    if (pathname === '/pos' || pathname === '/pos/') {
        res.writeHead(302, { Location: '/colaboradores' });
        res.end();
        return;
    }
    if (pathname === '/pos/app' || pathname === '/pos/app/') {
        res.writeHead(302, { Location: '/colaboradores/panel#venta' });
        res.end();
        return;
    }

    // Laboratorio: URL pública /laboratorio; archivos en public/materialab
    if (pathname === '/laboratorio' || pathname === '/materialab') {
        res.writeHead(301, { Location: '/laboratorio/materials' + (parsedUrl.search || '') });
        res.end();
        return;
    }
    if (pathname.startsWith('/materialab/') && !/\.(css|js)$/.test(pathname)) {
        const dest = pathname.replace(/^\/materialab/, '/laboratorio') + (parsedUrl.search || '');
        res.writeHead(301, { Location: dest });
        res.end();
        return;
    }

    // Estado del panel en la nube (ventas, cortes, precios, fórmulas,
    // inventario, materias primas, producción...). Compartido entre navegadores.
    if (pathname === '/api/state') {
        const respond = (code, obj) => {
            res.writeHead(code, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(obj));
        };
        const user = verifyPanelToken(req);
        if (!user) { respond(401, { ok: false, error: 'Unauthorized' }); return; }
        const q = parsedUrl.query || {};
        const key = q.key ? String(q.key) : null;

        if (req.method === 'GET') {
            if (USE_MONGO && getDb) {
                getDb().then(async (db) => {
                    if (q.meta) {
                        const m = await stateStore.getMeta(db);
                        return respond(200, { ok: true, updatedAt: m.updatedAt, count: m.count });
                    }
                    if (key) {
                        const one = await stateStore.getOne(db, key);
                        return respond(200, { ok: true, key: key, value: one ? one.value : null, updatedAt: one ? one.updatedAt : null });
                    }
                    const all = await stateStore.getAllState(db);
                    return respond(200, { ok: true, state: all.state, updatedAt: all.updatedAt });
                }).catch((e) => respond(500, { ok: false, error: e.message }));
                return;
            }
            const store = readStateFile();
            if (q.meta) {
                let updatedAt = null, count = 0;
                Object.keys(store).forEach((k) => {
                    if (!stateStore.isSyncableKey(k)) return;
                    count += 1;
                    const u = store[k] && store[k].updatedAt;
                    if (u && (!updatedAt || u > updatedAt)) updatedAt = u;
                });
                return respond(200, { ok: true, updatedAt: updatedAt, count: count });
            }
            if (key) {
                const rec = store[key];
                return respond(200, { ok: true, key: key, value: (rec && typeof rec.value === 'string') ? rec.value : null, updatedAt: rec ? rec.updatedAt : null });
            }
            const state = {};
            let latest = null;
            Object.keys(store).forEach((k) => {
                if (!stateStore.isSyncableKey(k)) return;
                const rec = store[k];
                state[k] = (rec && typeof rec.value === 'string') ? rec.value : null;
                if (rec && rec.updatedAt && (!latest || rec.updatedAt > latest)) latest = rec.updatedAt;
            });
            return respond(200, { ok: true, state: state, updatedAt: latest });
        }

        if (req.method === 'PUT' || req.method === 'POST') {
            if (!key) { respond(400, { ok: false, error: 'Falta key' }); return; }
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
                if (body.length > 12 * 1024 * 1024) req.destroy();
            });
            req.on('end', () => {
                let parsed = {};
                try { parsed = JSON.parse(body || '{}'); } catch (_) {}
                const value = parsed.value;
                if (!stateStore.isSyncableKey(key)) { respond(400, { ok: false, error: 'Clave no permitida' }); return; }
                if (typeof value !== 'string') { respond(400, { ok: false, error: 'value debe ser string' }); return; }
                if (USE_MONGO && getDb) {
                    getDb().then(async (db) => {
                        const r = await stateStore.putState(db, key, value, user);
                        respond(200, { ok: true, key: key, updatedAt: r.updatedAt });
                    }).catch((e) => respond(e && e.status ? e.status : 500, { ok: false, error: e.message }));
                    return;
                }
                const store = readStateFile();
                const updatedAt = new Date().toISOString();
                store[key] = { value: value, updatedAt: updatedAt, updatedBy: user.sub || user.username || null };
                writeStateFile(store);
                respond(200, { ok: true, key: key, updatedAt: updatedAt });
            });
            return;
        }

        respond(405, { ok: false, error: 'Method Not Allowed' });
        return;
    }

    // Servir archivos estáticos
    let filePath;
    
    if (pathname === '/') {
        filePath = path.join(__dirname, 'public', 'index.html');
    } else if (pathname.startsWith('/laboratorio/')) {
        const rest = pathname.slice('/laboratorio'.length);
        filePath = path.join(__dirname, 'public', 'materialab' + rest);
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
