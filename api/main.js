// api/main.js - API Principal del Sistema ERP S-35
const { getCollections } = require('./mongodb');
const { validateDocument, buildSearchQuery, buildSortOptions } = require('./models');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

// Middleware de autenticación
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ success: false, message: 'Token no proporcionado' });

    jwt.verify(token, process.env.JWT_SECRET || 's35-admin-secret-key-2024', (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Token inválido o expirado' });
        req.user = user;
        next();
    });
}

// Función para manejar el body de la request
function getRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(error);
            }
        });
    });
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method, url } = req;
        const path = url.split('?')[0];
        const queryParams = new URLSearchParams(url.split('?')[1] || '');

        // Verificar si MongoDB está disponible
        let collections;
        let useMongoDB = false;
        
        try {
            if (process.env.MONGODB_URI) {
                collections = await getCollections();
                useMongoDB = true;
            }
        } catch (error) {
            console.log('MongoDB no disponible, usando datos simulados');
        }

        // ==================== AUTENTICACIÓN ====================
        
        // POST /api/login - Login de usuarios
        if (method === 'POST' && path === '/api/login') {
            const body = await getRequestBody(req);
            const { username, password } = body;

            let user;
            if (useMongoDB) {
                user = await collections.users.findOne({ username, password });
            } else {
                // Datos simulados
                const mockUsers = [
                    { _id: '1', username: 'admin', password: 'admin123', userType: 'pdc', email: 'admin@s35.com.mx' },
                    { _id: '2', username: 'ventas1', password: 'ventas123', userType: 'pos', email: 'ventas1@s35.com.mx' },
                    { _id: '3', username: 'cliente1', password: 'cliente123', userType: 'client', email: 'cliente1@s35.com.mx' },
                    { _id: '4', username: 'colaborador1', password: 'colab123', userType: 'colaborador', email: 'colab1@s35.com.mx' }
                ];
                user = mockUsers.find(u => u.username === username && u.password === password);
            }

            if (!user) {
                return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
            }

            const token = jwt.sign(
                { userId: user._id, username: user.username, userType: user.userType },
                process.env.JWT_SECRET || 's35-admin-secret-key-2024',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                token,
                user: {
                    _id: user._id,
                    username: user.username,
                    userType: user.userType,
                    email: user.email
                }
            });
        }

        // ==================== PRODUCTOS ====================

        // GET /api/products - Obtener productos
        if (method === 'GET' && path === '/api/products') {
            let products;
            if (useMongoDB) {
                const filters = {
                    search: queryParams.get('search'),
                    category: queryParams.get('category'),
                    status: queryParams.get('status')
                };
                const query = buildSearchQuery(filters);
                products = await collections.products.find(query).toArray();
            } else {
                // Datos simulados
                products = [
                    {
                        _id: '1',
                        name: 'Basecoat Blanco Absoluto',
                        description: 'Base de alta calidad para acabados perfectos',
                        price: 450,
                        cost: 200,
                        category: 'Base',
                        sku: 'BC-BLANCO-ABS-001',
                        barcode: '100000000001',
                        stock: 150,
                        minStock: 20,
                        status: 'active',
                        image: 'basecoat-blanco-absoluto.png',
                        supplier: 'Proveedor A',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        _id: '2',
                        name: 'Estuco Base Pro+',
                        description: 'Estuco base para exteriores e interiores',
                        price: 380,
                        cost: 180,
                        category: 'Acabado',
                        sku: 'EST-BASE-PRO-001',
                        barcode: '100000000002',
                        stock: 89,
                        minStock: 15,
                        status: 'active',
                        image: 'estuco-base-pro.png',
                        supplier: 'Proveedor B',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        _id: '3',
                        name: 'Ultraforce Adhesivo',
                        description: 'Adhesivo de máxima fuerza',
                        price: 520,
                        cost: 250,
                        category: 'Adhesivo',
                        sku: 'ADH-ULTRA-001',
                        barcode: '100000000003',
                        stock: 12,
                        minStock: 10,
                        status: 'low_stock',
                        image: 'ultraforce.png',
                        supplier: 'Proveedor C',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
            }

            return res.status(200).json({ success: true, data: products, total: products.length });
        }

        // POST /api/products - Crear producto
        if (method === 'POST' && path === '/api/products') {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ success: false, message: 'Acceso denegado' });
                }

                const body = await getRequestBody(req);
                const errors = validateDocument('product', body);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
                }

                body.createdAt = new Date();
                body.updatedAt = new Date();
                body.status = body.stock > body.minStock ? 'active' : (body.stock > 0 ? 'low_stock' : 'out_of_stock');

                if (useMongoDB) {
                    const result = await collections.products.insertOne(body);
                    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...body } });
                } else {
                    body._id = (Date.now()).toString();
                    return res.status(201).json({ success: true, data: body });
                }
            });
        }

        // PUT /api/products/:id - Actualizar producto
        if (method === 'PUT' && path.startsWith('/api/products/')) {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ success: false, message: 'Acceso denegado' });
                }

                const productId = path.split('/')[3];
                const body = await getRequestBody(req);
                const errors = validateDocument('product', body);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
                }

                body.updatedAt = new Date();
                body.status = body.stock > body.minStock ? 'active' : (body.stock > 0 ? 'low_stock' : 'out_of_stock');

                if (useMongoDB) {
                    if (!ObjectId.isValid(productId)) {
                        return res.status(400).json({ success: false, message: 'ID inválido' });
                    }
                    const result = await collections.products.findOneAndUpdate(
                        { _id: new ObjectId(productId) },
                        { $set: body },
                        { returnDocument: 'after' }
                    );
                    if (!result.value) {
                        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
                    }
                    return res.status(200).json({ success: true, data: result.value });
                } else {
                    return res.status(200).json({ success: true, data: { ...body, _id: productId } });
                }
            });
        }

        // DELETE /api/products/:id - Eliminar producto
        if (method === 'DELETE' && path.startsWith('/api/products/')) {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ success: false, message: 'Acceso denegado' });
                }

                const productId = path.split('/')[3];

                if (useMongoDB) {
                    if (!ObjectId.isValid(productId)) {
                        return res.status(400).json({ success: false, message: 'ID inválido' });
                    }
                    const result = await collections.products.deleteOne({ _id: new ObjectId(productId) });
                    if (result.deletedCount === 0) {
                        return res.status(404).json({ success: false, message: 'Producto no encontrado' });
                    }
                }

                return res.status(200).json({ success: true, message: 'Producto eliminado' });
            });
        }

        // ==================== USUARIOS ====================

        // GET /api/users - Obtener usuarios
        if (method === 'GET' && path === '/api/users') {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ success: false, message: 'Acceso denegado' });
                }

                let users;
                if (useMongoDB) {
                    users = await collections.users.find({}).toArray();
                } else {
                    users = [
                        { _id: '1', username: 'admin', userType: 'pdc', email: 'admin@s35.com.mx', createdAt: new Date() },
                        { _id: '2', username: 'ventas1', userType: 'pos', email: 'ventas1@s35.com.mx', createdAt: new Date() },
                        { _id: '3', username: 'cliente1', userType: 'client', email: 'cliente1@s35.com.mx', createdAt: new Date() },
                        { _id: '4', username: 'colaborador1', userType: 'colaborador', email: 'colab1@s35.com.mx', createdAt: new Date() }
                    ];
                }

                return res.status(200).json({ success: true, data: users, total: users.length });
            });
        }

        // POST /api/users - Crear usuario
        if (method === 'POST' && path === '/api/users') {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ success: false, message: 'Acceso denegado' });
                }

                const body = await getRequestBody(req);
                const errors = validateDocument('user', body);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
                }

                body.createdAt = new Date();
                body.updatedAt = new Date();

                if (useMongoDB) {
                    const result = await collections.users.insertOne(body);
                    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...body } });
                } else {
                    body._id = (Date.now()).toString();
                    return res.status(201).json({ success: true, data: body });
                }
            });
        }

        // ==================== CLIENTES ====================

        // GET /api/clients - Obtener clientes
        if (method === 'GET' && path === '/api/clients') {
            let clients;
            if (useMongoDB) {
                clients = await collections.clients.find({}).toArray();
            } else {
                clients = [
                    {
                        _id: '1',
                        name: 'Constructora del Norte S.A. de C.V.',
                        email: 'contacto@constructoradelnorte.com.mx',
                        phone: '8112345678',
                        address: 'Av. Principal 100, Monterrey, N.L.',
                        rfc: 'CDN810101ABC',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    {
                        _id: '2',
                        name: 'Inmobiliaria del Pacífico',
                        email: 'ventas@inmobiliariapacifico.com',
                        phone: '3312345678',
                        address: 'Calle Marina 200, Puerto Vallarta, Jal.',
                        rfc: 'IPA330101DEF',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
            }

            return res.status(200).json({ success: true, data: clients, total: clients.length });
        }

        // POST /api/clients - Crear cliente
        if (method === 'POST' && path === '/api/clients') {
            authenticateToken(req, res, async () => {
                const body = await getRequestBody(req);
                const errors = validateDocument('client', body);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
                }

                body.createdAt = new Date();
                body.updatedAt = new Date();

                if (useMongoDB) {
                    const result = await collections.clients.insertOne(body);
                    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...body } });
                } else {
                    body._id = (Date.now()).toString();
                    return res.status(201).json({ success: true, data: body });
                }
            });
        }

        // ==================== PEDIDOS ====================

        // GET /api/orders - Obtener pedidos
        if (method === 'GET' && path === '/api/orders') {
            let orders;
            if (useMongoDB) {
                orders = await collections.orders.find({}).toArray();
            } else {
                orders = [
                    {
                        _id: '1',
                        clientId: '1',
                        clientName: 'Constructora del Norte S.A. de C.V.',
                        items: [
                            { productId: '1', productName: 'Basecoat Blanco Absoluto', quantity: 20, price: 450 }
                        ],
                        totalAmount: 9000,
                        status: 'processing',
                        orderType: 'order',
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        updatedAt: new Date()
                    }
                ];
            }

            return res.status(200).json({ success: true, data: orders, total: orders.length });
        }

        // POST /api/orders - Crear pedido
        if (method === 'POST' && path === '/api/orders') {
            authenticateToken(req, res, async () => {
                const body = await getRequestBody(req);
                const errors = validateDocument('order', body);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
                }

                body.createdAt = new Date();
                body.updatedAt = new Date();

                if (useMongoDB) {
                    const result = await collections.orders.insertOne(body);
                    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...body } });
                } else {
                    body._id = (Date.now()).toString();
                    return res.status(201).json({ success: true, data: body });
                }
            });
        }

        // ==================== COTIZACIONES ====================

        // GET /api/quotes - Obtener cotizaciones
        if (method === 'GET' && path === '/api/quotes') {
            let quotes;
            if (useMongoDB) {
                quotes = await collections.quotes.find({}).toArray();
            } else {
                quotes = [
                    {
                        _id: '1',
                        clientId: '1',
                        clientName: 'Constructora del Norte S.A. de C.V.',
                        items: [
                            { productId: '1', productName: 'Basecoat Blanco Absoluto', quantity: 20, price: 450 }
                        ],
                        totalAmount: 9000,
                        status: 'pending',
                        orderType: 'quote',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                        updatedAt: new Date()
                    }
                ];
            }

            return res.status(200).json({ success: true, data: quotes, total: quotes.length });
        }

        // POST /api/quotes - Crear cotización
        if (method === 'POST' && path === '/api/quotes') {
            authenticateToken(req, res, async () => {
                const body = await getRequestBody(req);
                const errors = validateDocument('order', body);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos inválidos', errors });
                }

                body.createdAt = new Date();
                body.updatedAt = new Date();
                body.orderType = 'quote';
                body.status = 'pending';

                if (useMongoDB) {
                    const result = await collections.quotes.insertOne(body);
                    return res.status(201).json({ success: true, data: { _id: result.insertedId, ...body } });
                } else {
                    body._id = (Date.now()).toString();
                    return res.status(201).json({ success: true, data: body });
                }
            });
        }

        // ==================== ESTADÍSTICAS ====================

        // GET /api/stats - Estadísticas generales
        if (method === 'GET' && path === '/api/stats') {
            let stats;
            if (useMongoDB) {
                const totalProducts = await collections.products.countDocuments();
                const totalUsers = await collections.users.countDocuments();
                const totalOrders = await collections.orders.countDocuments();
                const totalClients = await collections.clients.countDocuments();
                const totalQuotes = await collections.quotes.countDocuments();

                const revenueResult = await collections.orders.aggregate([
                    { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
                ]).toArray();
                const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalAmount : 0;

                stats = {
                    totalProducts,
                    totalUsers,
                    totalOrders,
                    totalClients,
                    totalQuotes,
                    totalRevenue
                };
            } else {
                stats = {
                    totalProducts: 3,
                    totalUsers: 4,
                    totalOrders: 1,
                    totalClients: 2,
                    totalQuotes: 1,
                    totalRevenue: 9000
                };
            }

            return res.status(200).json({ success: true, data: stats });
        }

        // GET /api/orders/stats - Estadísticas de pedidos
        if (method === 'GET' && path === '/api/orders/stats') {
            let stats;
            if (useMongoDB) {
                const totalOrders = await collections.orders.countDocuments();
                const totalQuotes = await collections.quotes.countDocuments();
                const totalClients = await collections.clients.countDocuments();

                const revenueResult = await collections.orders.aggregate([
                    { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
                ]).toArray();
                const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalAmount : 0;

                const recentOrders = await collections.orders.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .toArray();

                const recentQuotes = await collections.quotes.find({})
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .toArray();

                stats = {
                    totalOrders,
                    totalQuotes,
                    totalClients,
                    totalRevenue,
                    recentOrders,
                    recentQuotes
                };
            } else {
                stats = {
                    totalOrders: 45,
                    totalQuotes: 23,
                    totalClients: 12,
                    totalRevenue: 245680,
                    recentOrders: [
                        {
                            _id: '1',
                            clientName: 'Constructora del Norte',
                            totalAmount: 12500,
                            status: 'delivered',
                            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
                        }
                    ],
                    recentQuotes: [
                        {
                            _id: '1',
                            clientName: 'Arquitectura Moderna',
                            totalAmount: 15600,
                            status: 'pending',
                            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                        }
                    ]
                };
            }

            return res.status(200).json({ success: true, data: stats });
        }

        // ==================== INFORMACIÓN DEL SISTEMA ====================

        // GET /api - Información del sistema
        if (method === 'GET' && (path === '/api' || path === '/')) {
            return res.status(200).json({
                success: true,
                message: 'Sistema S-35 ERP funcionando',
                version: '1.1.6',
                timestamp: new Date().toISOString(),
                mongodb_configured: !!process.env.MONGODB_URI,
                mongodb_connected: useMongoDB
            });
        }

        // Ruta no encontrada
        return res.status(404).json({
            success: false,
            message: 'Ruta no encontrada',
            path: path
        });

    } catch (error) {
        console.error('Error en API principal:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
