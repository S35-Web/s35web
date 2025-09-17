// api/index.js - API principal de Vercel
const jwt = require('jsonwebtoken');

// Datos en memoria
let products = [
    {
        _id: '1',
        name: 'Basecoat Blanco Absoluto',
        category: 'Base',
        price: 450,
        stock: 150,
        minStock: 20,
        description: 'Base para estuco de alta calidad',
        image: 'basecoat-blanco-absoluto.png',
        sku: 'BC-BLANCO-ABS-001',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '2',
        name: 'Estuco Base Pro+',
        category: 'Acabado',
        price: 380,
        stock: 89,
        minStock: 15,
        description: 'Estuco de acabado premium',
        image: 'estuco-base-pro.png',
        sku: 'EST-BASE-PRO-001',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '3',
        name: 'Ultraforce',
        category: 'Adhesivo',
        price: 520,
        stock: 12,
        minStock: 10,
        description: 'Adhesivo de ultra fuerza',
        image: 'ultraforce.png',
        sku: 'ADH-ULTRA-001',
        status: 'low_stock',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

let users = [
    {
        _id: '1',
        username: 'admin',
        password: 'admin123',
        userType: 'pdc',
        email: 'admin@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '2',
        username: 'ventas1',
        password: 'ventas123',
        userType: 'pos',
        email: 'ventas1@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '3',
        username: 'cliente1',
        password: 'cliente123',
        userType: 'client',
        email: 'cliente1@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

let orders = [];
let clients = [
    {
        _id: '1',
        name: 'Constructora del Norte S.A. de C.V.',
        email: 'compras@constructoranorte.com.mx',
        phone: '6671234567',
        address: 'Av. Insurgentes 123, Culiacán, Sinaloa',
        rfc: 'CON123456789',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Middleware de autenticación
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Token requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 's35-admin-secret-key-2024', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token inválido' });
        }
        req.user = user;
        next();
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
        
        console.log('Request:', method, path); // Debug log

        // GET /api - Información del sistema
        if (method === 'GET' && (path === '/api' || path === '/')) {
            return res.status(200).json({
                success: true,
                message: 'Sistema S-35 ERP funcionando',
                version: '1.1.6',
                timestamp: new Date().toISOString(),
                mongodb_configured: !!process.env.MONGODB_URI
            });
        }

        // GET /api/products - Obtener productos
        if (method === 'GET' && (path === '/api/products' || path === '/products')) {
            return res.status(200).json({
                success: true,
                data: products,
                total: products.length
            });
        }

        // POST /api/products - Crear producto
        if (method === 'POST' && (path === '/api/products' || path === '/products')) {
            authenticateToken(req, res, () => {
                const newProduct = JSON.parse(req.body);
                newProduct._id = (products.length + 1).toString();
                newProduct.createdAt = new Date();
                newProduct.updatedAt = new Date();
                newProduct.status = newProduct.stock > newProduct.minStock ? 'active' : 'low_stock';
                products.push(newProduct);
                
                return res.status(201).json({
                    success: true,
                    message: 'Producto creado exitosamente',
                    data: newProduct
                });
            });
        }

        // GET /api/users - Obtener usuarios
        if (method === 'GET' && (path === '/api/users' || path === '/users')) {
            return res.status(200).json({
                success: true,
                data: users,
                total: users.length
            });
        }

        // POST /api/users - Crear usuario
        if (method === 'POST' && (path === '/api/users' || path === '/users')) {
            authenticateToken(req, res, () => {
                const newUser = JSON.parse(req.body);
                newUser._id = (users.length + 1).toString();
                newUser.createdAt = new Date();
                newUser.updatedAt = new Date();
                users.push(newUser);
                
                return res.status(201).json({
                    success: true,
                    message: 'Usuario creado exitosamente',
                    data: newUser
                });
            });
        }

        // POST /api/login - Login
        if (method === 'POST' && (path === '/api/login' || path === '/login')) {
            const { username, password } = JSON.parse(req.body);
            const user = users.find(u => u.username === username && u.password === password);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
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

        // GET /api/orders - Obtener pedidos
        if (method === 'GET' && (path === '/api/orders' || path === '/orders')) {
            return res.status(200).json({
                success: true,
                data: orders,
                total: orders.length
            });
        }

        // POST /api/orders - Crear pedido
        if (method === 'POST' && (path === '/api/orders' || path === '/orders')) {
            authenticateToken(req, res, () => {
                const newOrder = JSON.parse(req.body);
                newOrder._id = (orders.length + 1).toString();
                newOrder.createdAt = new Date();
                newOrder.updatedAt = new Date();
                orders.push(newOrder);
                
                return res.status(201).json({
                    success: true,
                    message: 'Pedido creado exitosamente',
                    data: newOrder
                });
            });
        }

        // GET /api/clients - Obtener clientes
        if (method === 'GET' && (path === '/api/clients' || path === '/clients')) {
            return res.status(200).json({
                success: true,
                data: clients,
                total: clients.length
            });
        }

        // POST /api/clients - Crear cliente
        if (method === 'POST' && (path === '/api/clients' || path === '/clients')) {
            authenticateToken(req, res, () => {
                const newClient = JSON.parse(req.body);
                newClient._id = (clients.length + 1).toString();
                newClient.createdAt = new Date();
                newClient.updatedAt = new Date();
                clients.push(newClient);
                
                return res.status(201).json({
                    success: true,
                    message: 'Cliente creado exitosamente',
                    data: newClient
                });
            });
        }

            // GET /api/stats - Estadísticas
            if (method === 'GET' && (path === '/api/stats' || path === '/stats')) {
                return res.status(200).json({
                    success: true,
                    data: {
                        products: products.length,
                        users: users.length,
                        orders: orders.length,
                        clients: clients.length,
                        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
                    }
                });
            }

            // GET /api/orders/stats - Estadísticas de pedidos
            if (method === 'GET' && (path === '/api/orders/stats' || path === '/orders/stats')) {
                const mockStats = {
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
                        },
                        {
                            _id: '2',
                            clientName: 'Inmobiliaria del Pacífico',
                            totalAmount: 8900,
                            status: 'processing',
                            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
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

                return res.status(200).json({
                    success: true,
                    data: mockStats
                });
            }

            // GET /api/quotes - Obtener cotizaciones
            if (method === 'GET' && (path === '/api/quotes' || path === '/quotes')) {
                const mockQuotes = [
                    {
                        _id: '1',
                        clientId: '1',
                        clientName: 'Constructora del Norte S.A. de C.V.',
                        items: [
                            {
                                productId: '1',
                                productName: 'Basecoat Blanco Absoluto',
                                quantity: 20,
                                price: 450
                            },
                            {
                                productId: '2',
                                productName: 'Estuco Base Pro+',
                                quantity: 15,
                                price: 380
                            }
                        ],
                        totalAmount: 17700,
                        status: 'pending',
                        orderType: 'quote',
                        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                    },
                    {
                        _id: '2',
                        clientId: '2',
                        clientName: 'Inmobiliaria del Pacífico',
                        items: [
                            {
                                productId: '3',
                                productName: 'Ultraforce Adhesivo',
                                quantity: 10,
                                price: 520
                            }
                        ],
                        totalAmount: 5200,
                        status: 'payment_received',
                        orderType: 'quote',
                        paymentProof: 'https://example.com/payment-proof-2.pdf',
                        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                    }
                ];

                return res.status(200).json({
                    success: true,
                    data: mockQuotes,
                    total: mockQuotes.length
                });
            }

        // Ruta no encontrada
        return res.status(404).json({
            success: false,
            message: 'Ruta no encontrada'
        });

    } catch (error) {
        console.error('Error en API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
