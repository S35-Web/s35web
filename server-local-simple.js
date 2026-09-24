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
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    token: 'local-dev-token-' + role,
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

    // Sync cloud del panel (mismas claves que api/panel-state.js)
    if (pathname === '/api/panel-state') {
        const dir = path.join(__dirname, '.data', 'panel-state');
        const allowed = new Set([
            's35_plant_inventory',
            's35_plant_families',
            's35_finished_stock',
            's35_plant_formulas_v3',
            's35_production_lots',
            's35_compra_tickets',
            's35_plant_unit_costs_v1',
            's35_plant_count_20260922b',
            's35_pos_prices_v4',
            's35_pos_sales',
            's35_sale_edits_v1',
            's35_promo_codes_v1',
            's35_product_families',
            's35_product_family_overrides',
            's35_hist_sales_imported_v13'
        ]);
        const readKey = (key) => {
            try {
                const p = path.join(dir, key + '.json');
                if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
            } catch (_) {}
            return null;
        };
        if (req.method === 'GET') {
            const stores = {};
            allowed.forEach((key) => {
                const doc = readKey(key);
                if (doc) stores[key] = { value: doc.value, updatedAt: doc.updatedAt || null };
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, keys: Array.from(allowed), stores: stores, strategy: 'last-write-wins:updatedAt' }));
            return;
        }
        if (req.method === 'PUT') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const parsed = JSON.parse(body || '{}');
                    const incoming = parsed.stores && typeof parsed.stores === 'object' ? parsed.stores : null;
                    if (!incoming) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ ok: false, error: 'Falta stores{}' }));
                        return;
                    }
                    fs.mkdirSync(dir, { recursive: true });
                    const accepted = [];
                    const rejected = [];
                    const out = {};
                    Object.keys(incoming).forEach((key) => {
                        if (!allowed.has(key)) return;
                        const entry = incoming[key];
                        if (!entry || typeof entry !== 'object') {
                            rejected.push({ key: key, reason: 'invalid-entry' });
                            return;
                        }
                        const updatedAt = entry.updatedAt || new Date().toISOString();
                        const prev = readKey(key);
                        if (prev && prev.updatedAt && Date.parse(updatedAt) < Date.parse(prev.updatedAt)) {
                            rejected.push({ key: key, reason: 'stale', remoteUpdatedAt: prev.updatedAt });
                            out[key] = { value: prev.value, updatedAt: prev.updatedAt };
                            return;
                        }
                        const doc = { value: entry.value, updatedAt: updatedAt };
                        fs.writeFileSync(path.join(dir, key + '.json'), JSON.stringify(doc));
                        accepted.push(key);
                        out[key] = doc;
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, accepted: accepted, rejected: rejected, stores: out, strategy: 'last-write-wins:updatedAt' }));
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

    // Estado de planta (inventario / lotes) — archivo local en desarrollo
    if (pathname === '/api/plant-state') {
        const livePath = path.join(__dirname, '.data', 'plant-state-live.json');
        const readDoc = () => {
            try {
                if (fs.existsSync(livePath)) {
                    return JSON.parse(fs.readFileSync(livePath, 'utf8'));
                }
            } catch (_) {}
            return null;
        };
        if (req.method === 'GET') {
            const doc = readDoc();
            if (!doc) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    empty: true,
                    inventory: [],
                    finished: {},
                    formulas: {},
                    lots: [],
                    purchases: [],
                    updatedAt: null
                }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                ok: true,
                empty: false,
                inventory: Array.isArray(doc.inventory) ? doc.inventory : [],
                finished: doc.finished && typeof doc.finished === 'object' ? doc.finished : {},
                formulas: doc.formulas && typeof doc.formulas === 'object' ? doc.formulas : {},
                lots: Array.isArray(doc.lots) ? doc.lots : [],
                purchases: Array.isArray(doc.purchases) ? doc.purchases : [],
                updatedAt: doc.updatedAt || null
            }));
            return;
        }
        if (req.method === 'PUT') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
                try {
                    const parsed = JSON.parse(body || '{}');
                    const doc = {
                        inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
                        finished: parsed.finished && typeof parsed.finished === 'object' ? parsed.finished : {},
                        formulas: parsed.formulas && typeof parsed.formulas === 'object' ? parsed.formulas : {},
                        lots: Array.isArray(parsed.lots) ? parsed.lots.slice(0, 300) : [],
                        purchases: Array.isArray(parsed.purchases) ? parsed.purchases.slice(0, 200) : [],
                        updatedAt: new Date().toISOString()
                    };
                    fs.mkdirSync(path.dirname(livePath), { recursive: true });
                    fs.writeFileSync(livePath, JSON.stringify(doc));
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        ok: true,
                        updatedAt: doc.updatedAt,
                        totals: {
                            inventory: doc.inventory.length,
                            formulas: Object.keys(doc.formulas).length,
                            lots: doc.lots.length,
                            purchases: doc.purchases.length
                        }
                    }));
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
