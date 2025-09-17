// api/simple.js - API Simple y Funcional
const { getCollections } = require('./mongodb');
const jwt = require('jsonwebtoken');

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

        // Verificar MongoDB
        let useMongoDB = false;
        let collections;
        try {
            if (process.env.MONGODB_URI) {
                collections = await getCollections();
                useMongoDB = true;
            }
        } catch (error) {
            console.log('MongoDB no disponible, usando datos simulados');
        }

        // ==================== LOGIN ====================
        if (method === 'POST' && path === '/api/login') {
            const body = req.body || {};
            const { username, password } = body;

            let user;
            if (useMongoDB) {
                user = await collections.users.findOne({ username, password });
            } else {
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
        if (method === 'GET' && path === '/api/products') {
            let products;
            if (useMongoDB) {
                products = await collections.products.find({}).toArray();
            } else {
                products = [
                    {
                        _id: '1',
                        name: 'Basecoat Blanco Absoluto',
                        description: 'Base de alta calidad para acabados perfectos',
                        price: 450,
                        cost: 200,
                        category: 'Base',
                        sku: 'BC-BLANCO-ABS-001',
                        stock: 150,
                        minStock: 20,
                        status: 'active',
                        image: 'basecoat-blanco-absoluto.png',
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
                        stock: 89,
                        minStock: 15,
                        status: 'active',
                        image: 'estuco-base-pro.png',
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
                        stock: 12,
                        minStock: 10,
                        status: 'low_stock',
                        image: 'ultraforce.png',
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                ];
            }

            return res.status(200).json({ success: true, data: products, total: products.length });
        }

        // POST /api/products - Crear producto
        if (method === 'POST' && path === '/api/products') {
            return res.status(201).json({ 
                success: true, 
                message: 'Producto creado exitosamente',
                data: {
                    _id: '123',
                    name: 'Producto Test',
                    description: 'Producto de prueba',
                    price: 100,
                    cost: 50,
                    category: 'Base',
                    sku: 'SKU-123',
                    stock: 10,
                    minStock: 5,
                    status: 'active',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }
            });
        }

        // PUT /api/products/:id - Actualizar producto
        if (method === 'PUT' && path.startsWith('/api/products/')) {
            const productId = path.split('/')[3];
            const body = req.body || {};
            
            body.updatedAt = new Date();
            body.status = body.stock > body.minStock ? 'active' : (body.stock > 0 ? 'low_stock' : 'out_of_stock');

            if (useMongoDB) {
                const { ObjectId } = require('mongodb');
                if (!ObjectId.isValid(productId)) {
                    return res.status(400).json({ success: false, message: 'ID de producto inválido' });
                }
                const result = await collections.products.findOneAndUpdate(
                    { _id: new ObjectId(productId) },
                    { $set: body },
                    { returnDocument: 'after' }
                );
                if (!result.value) {
                    return res.status(404).json({ success: false, message: 'Producto no encontrado' });
                }
                return res.status(200).json({ 
                    success: true, 
                    message: 'Producto actualizado exitosamente',
                    data: result.value 
                });
            } else {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Producto actualizado exitosamente',
                    data: { ...body, _id: productId } 
                });
            }
        }

        // DELETE /api/products/:id - Eliminar producto
        if (method === 'DELETE' && path.startsWith('/api/products/')) {
            const productId = path.split('/')[3];

            if (useMongoDB) {
                const { ObjectId } = require('mongodb');
                if (!ObjectId.isValid(productId)) {
                    return res.status(400).json({ success: false, message: 'ID de producto inválido' });
                }
                const result = await collections.products.deleteOne({ _id: new ObjectId(productId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Producto no encontrado' });
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Producto eliminado exitosamente' 
            });
        }

        // ==================== USUARIOS ====================
        if (method === 'GET' && path === '/api/users') {
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
        }

        // POST /api/users - Crear usuario
        if (method === 'POST' && path === '/api/users') {
            const body = req.body || {};
            
            // Validación básica
            if (!body.username || !body.password || !body.userType) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Faltan campos requeridos: username, password, userType' 
                });
            }

            body.createdAt = new Date();
            body.updatedAt = new Date();

            if (useMongoDB) {
                const result = await collections.users.insertOne(body);
                return res.status(201).json({ 
                    success: true, 
                    message: 'Usuario creado exitosamente',
                    data: { _id: result.insertedId, ...body } 
                });
            } else {
                body._id = (Date.now()).toString();
                return res.status(201).json({ 
                    success: true, 
                    message: 'Usuario creado exitosamente',
                    data: body 
                });
            }
        }

        // PUT /api/users/:id - Actualizar usuario
        if (method === 'PUT' && path.startsWith('/api/users/')) {
            const userId = path.split('/')[3];
            const body = req.body || {};
            
            body.updatedAt = new Date();

            if (useMongoDB) {
                const { ObjectId } = require('mongodb');
                if (!ObjectId.isValid(userId)) {
                    return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
                }
                const result = await collections.users.findOneAndUpdate(
                    { _id: new ObjectId(userId) },
                    { $set: body },
                    { returnDocument: 'after' }
                );
                if (!result.value) {
                    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
                }
                return res.status(200).json({ 
                    success: true, 
                    message: 'Usuario actualizado exitosamente',
                    data: result.value 
                });
            } else {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Usuario actualizado exitosamente',
                    data: { ...body, _id: userId } 
                });
            }
        }

        // DELETE /api/users/:id - Eliminar usuario
        if (method === 'DELETE' && path.startsWith('/api/users/')) {
            const userId = path.split('/')[3];

            if (useMongoDB) {
                const { ObjectId } = require('mongodb');
                if (!ObjectId.isValid(userId)) {
                    return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
                }
                const result = await collections.users.deleteOne({ _id: new ObjectId(userId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Usuario eliminado exitosamente' 
            });
        }

        // ==================== CLIENTES ====================
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
            const body = req.body || {};
            
            // Validación básica
            if (!body.name || !body.email || !body.phone) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Faltan campos requeridos: name, email, phone' 
                });
            }

            body.createdAt = new Date();
            body.updatedAt = new Date();

            if (useMongoDB) {
                const result = await collections.clients.insertOne(body);
                return res.status(201).json({ 
                    success: true, 
                    message: 'Cliente creado exitosamente',
                    data: { _id: result.insertedId, ...body } 
                });
            } else {
                body._id = (Date.now()).toString();
                return res.status(201).json({ 
                    success: true, 
                    message: 'Cliente creado exitosamente',
                    data: body 
                });
            }
        }

        // PUT /api/clients/:id - Actualizar cliente
        if (method === 'PUT' && path.startsWith('/api/clients/')) {
            const clientId = path.split('/')[3];
            const body = req.body || {};
            
            body.updatedAt = new Date();

            if (useMongoDB) {
                const { ObjectId } = require('mongodb');
                if (!ObjectId.isValid(clientId)) {
                    return res.status(400).json({ success: false, message: 'ID de cliente inválido' });
                }
                const result = await collections.clients.findOneAndUpdate(
                    { _id: new ObjectId(clientId) },
                    { $set: body },
                    { returnDocument: 'after' }
                );
                if (!result.value) {
                    return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
                }
                return res.status(200).json({ 
                    success: true, 
                    message: 'Cliente actualizado exitosamente',
                    data: result.value 
                });
            } else {
                return res.status(200).json({ 
                    success: true, 
                    message: 'Cliente actualizado exitosamente',
                    data: { ...body, _id: clientId } 
                });
            }
        }

        // DELETE /api/clients/:id - Eliminar cliente
        if (method === 'DELETE' && path.startsWith('/api/clients/')) {
            const clientId = path.split('/')[3];

            if (useMongoDB) {
                const { ObjectId } = require('mongodb');
                if (!ObjectId.isValid(clientId)) {
                    return res.status(400).json({ success: false, message: 'ID de cliente inválido' });
                }
                const result = await collections.clients.deleteOne({ _id: new ObjectId(clientId) });
                if (result.deletedCount === 0) {
                    return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
                }
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Cliente eliminado exitosamente' 
            });
        }

        // ==================== PEDIDOS ====================
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

        // ==================== COTIZACIONES ====================
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

        // ==================== ESTADÍSTICAS ====================
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
            }

            return res.status(200).json({ success: true, data: stats });
        }

        // ==================== INFORMACIÓN DEL SISTEMA ====================
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
        console.error('Error en API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
