// api/orders.js - API de pedidos, cotizaciones y clientes con MongoDB
const jwt = require('jsonwebtoken');
const { getCollections } = require('./mongodb');
const { validateDocument } = require('./models');

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
        const queryParams = new URLSearchParams(url.split('?')[1] || '');
        
        const collections = await getCollections();

        // GET /api/orders - Obtener todos los pedidos
        if (method === 'GET' && path === '/api/orders') {
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 50;
            const status = queryParams.get('status') || '';
            const clientId = queryParams.get('clientId') || '';

            const query = { orderType: 'order' };
            if (status) query.status = status;
            if (clientId) query.clientId = clientId;

            const skip = (page - 1) * limit;
            const orders = await collections.orders
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await collections.orders.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: orders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }

        // GET /api/orders/:id - Obtener pedido por ID
        if (method === 'GET' && path.startsWith('/api/orders/') && !path.includes('/stats')) {
            const orderId = path.split('/')[3];
            const order = await collections.orders.findOne({ 
                _id: orderId, 
                orderType: 'order' 
            });
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Pedido no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: order
            });
        }

        // POST /api/orders - Crear nuevo pedido
        if (method === 'POST' && path === '/api/orders') {
            authenticateToken(req, res, async () => {
                const orderData = JSON.parse(req.body);
                
                // Validar datos
                const errors = validateDocument('order', orderData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Preparar datos del pedido
                const newOrder = {
                    ...orderData,
                    orderType: 'order',
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Insertar en la base de datos
                const result = await collections.orders.insertOne(newOrder);
                newOrder._id = result.insertedId;

                // Actualizar stock de productos
                for (const item of newOrder.items) {
                    await collections.products.updateOne(
                        { _id: item.productId },
                        { 
                            $inc: { stock: -item.quantity },
                            $set: { updatedAt: new Date() }
                        }
                    );
                }

                return res.status(201).json({
                    success: true,
                    message: 'Pedido creado exitosamente',
                    data: newOrder
                });
            });
        }

        // PUT /api/orders/:id - Actualizar estado del pedido
        if (method === 'PUT' && path.startsWith('/api/orders/')) {
            authenticateToken(req, res, async () => {
                const orderId = path.split('/')[3];
                const { status } = JSON.parse(req.body);

                const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Estado inválido'
                    });
                }

                const result = await collections.orders.updateOne(
                    { _id: orderId, orderType: 'order' },
                    { 
                        $set: { 
                            status, 
                            updatedAt: new Date() 
                        } 
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Pedido no encontrado'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Estado actualizado exitosamente'
                });
            });
        }

        // GET /api/quotes - Obtener todas las cotizaciones
        if (method === 'GET' && path === '/api/quotes') {
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 50;
            const status = queryParams.get('status') || '';
            const clientId = queryParams.get('clientId') || '';

            const query = { orderType: 'quote' };
            if (status) query.status = status;
            if (clientId) query.clientId = clientId;

            const skip = (page - 1) * limit;
            const quotes = await collections.orders
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await collections.orders.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: quotes,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }

        // POST /api/quotes - Crear nueva cotización
        if (method === 'POST' && path === '/api/quotes') {
            authenticateToken(req, res, async () => {
                const quoteData = JSON.parse(req.body);
                
                // Validar datos
                const errors = validateDocument('order', quoteData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Preparar datos de la cotización
                const newQuote = {
                    ...quoteData,
                    orderType: 'quote',
                    status: 'pending',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Insertar en la base de datos
                const result = await collections.orders.insertOne(newQuote);
                newQuote._id = result.insertedId;

                return res.status(201).json({
                    success: true,
                    message: 'Cotización creada exitosamente',
                    data: newQuote
                });
            });
        }

        // POST /api/quotes/:id/payment-proof - Subir comprobante de pago
        if (method === 'POST' && path.startsWith('/api/quotes/') && path.endsWith('/payment-proof')) {
            authenticateToken(req, res, async () => {
                const quoteId = path.split('/')[3];
                const { paymentProofUrl } = JSON.parse(req.body);

                const result = await collections.orders.updateOne(
                    { _id: quoteId, orderType: 'quote' },
                    { 
                        $set: { 
                            paymentProof: paymentProofUrl,
                            status: 'payment_received',
                            updatedAt: new Date() 
                        } 
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cotización no encontrada'
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Comprobante de pago subido exitosamente'
                });
            });
        }

        // POST /api/quotes/:id/convert - Convertir cotización a pedido
        if (method === 'POST' && path.startsWith('/api/quotes/') && !path.endsWith('/payment-proof')) {
            authenticateToken(req, res, async () => {
                const quoteId = path.split('/')[3];
                
                // Obtener la cotización
                const quote = await collections.orders.findOne({ 
                    _id: quoteId, 
                    orderType: 'quote' 
                });

                if (!quote) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cotización no encontrada'
                    });
                }

                // Crear el pedido
                const newOrder = {
                    ...quote,
                    orderType: 'order',
                    status: 'processing',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Insertar el pedido
                const result = await collections.orders.insertOne(newOrder);
                newOrder._id = result.insertedId;

                // Actualizar stock de productos
                for (const item of newOrder.items) {
                    await collections.products.updateOne(
                        { _id: item.productId },
                        { 
                            $inc: { stock: -item.quantity },
                            $set: { updatedAt: new Date() }
                        }
                    );
                }

                // Eliminar la cotización
                await collections.orders.deleteOne({ _id: quoteId });

                return res.status(200).json({
                    success: true,
                    message: 'Cotización convertida a pedido exitosamente',
                    data: newOrder
                });
            });
        }

        // GET /api/clients - Obtener todos los clientes
        if (method === 'GET' && path === '/api/clients') {
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 50;
            const search = queryParams.get('search') || '';

            const query = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;
            const clients = await collections.clients
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await collections.clients.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: clients,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }

        // POST /api/clients - Crear nuevo cliente
        if (method === 'POST' && path === '/api/clients') {
            authenticateToken(req, res, async () => {
                const clientData = JSON.parse(req.body);
                
                // Validar datos
                const errors = validateDocument('client', clientData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Verificar que el email no exista
                const existingClient = await collections.clients.findOne({ 
                    email: clientData.email 
                });
                if (existingClient) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }

                // Preparar datos del cliente
                const newClient = {
                    ...clientData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Insertar en la base de datos
                const result = await collections.clients.insertOne(newClient);
                newClient._id = result.insertedId;

                return res.status(201).json({
                    success: true,
                    message: 'Cliente creado exitosamente',
                    data: newClient
                });
            });
        }

        // GET /api/orders/stats - Estadísticas de pedidos
        if (method === 'GET' && path === '/api/orders/stats') {
            const pipeline = [
                {
                    $match: { orderType: 'order' }
                },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: { $sum: '$totalAmount' },
                        pendingOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                        },
                        processingOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
                        },
                        shippedOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
                        },
                        deliveredOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
                        },
                        cancelledOrders: {
                            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                        }
                    }
                }
            ];

            const stats = await collections.orders.aggregate(pipeline).toArray();
            const result = stats[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                processingOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0,
                cancelledOrders: 0
            };

            return res.status(200).json({
                success: true,
                data: result
            });
        }

        // Ruta no encontrada
        return res.status(404).json({
            success: false,
            message: 'Ruta no encontrada'
        });

    } catch (error) {
        console.error('Error en orders API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};