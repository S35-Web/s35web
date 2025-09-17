// API simplificada de pedidos sin MongoDB
const jwt = require('jsonwebtoken');

// Base de datos simulada
let orders = [];
let quotes = [];
let clients = [];

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

        // Obtener todos los pedidos
        if (method === 'GET' && path === '/api/orders') {
            return res.status(200).json({
                success: true,
                data: orders,
                total: orders.length
            });
        }

        // Obtener pedido por ID
        if (method === 'GET' && path.startsWith('/api/orders/') && !path.includes('/stats')) {
            const orderId = path.split('/')[3];
            const order = orders.find(o => o._id === orderId);
            
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

        // Crear nuevo pedido
        if (method === 'POST' && path === '/api/orders') {
            authenticateToken(req, res, () => {
                const orderData = {
                    _id: Date.now().toString(),
                    ...req.body,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                orders.push(orderData);

                return res.status(201).json({
                    success: true,
                    message: 'Pedido creado exitosamente',
                    data: orderData
                });
            });
        }

        // Obtener todas las cotizaciones
        if (method === 'GET' && path === '/api/quotes') {
            return res.status(200).json({
                success: true,
                data: quotes,
                total: quotes.length
            });
        }

        // Crear nueva cotización
        if (method === 'POST' && path === '/api/quotes') {
            authenticateToken(req, res, () => {
                const quoteData = {
                    _id: Date.now().toString(),
                    ...req.body,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                quotes.push(quoteData);

                return res.status(201).json({
                    success: true,
                    message: 'Cotización creada exitosamente',
                    data: quoteData
                });
            });
        }

        // Obtener todos los clientes
        if (method === 'GET' && path === '/api/clients') {
            return res.status(200).json({
                success: true,
                data: clients,
                total: clients.length
            });
        }

        // Crear nuevo cliente
        if (method === 'POST' && path === '/api/clients') {
            authenticateToken(req, res, () => {
                const clientData = {
                    _id: Date.now().toString(),
                    ...req.body,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                clients.push(clientData);

                return res.status(201).json({
                    success: true,
                    message: 'Cliente creado exitosamente',
                    data: clientData
                });
            });
        }

        // Obtener estadísticas de pedidos
        if (method === 'GET' && path === '/api/orders/stats') {
            const stats = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                completedOrders: orders.filter(o => o.status === 'completed').length
            };

            return res.status(200).json({
                success: true,
                data: stats
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
