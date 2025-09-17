// API para gestión de pedidos y cotizaciones
const jwt = require('jsonwebtoken');

// Base de datos simulada
let orders = [
    {
        id: 1,
        folio: 'S35-10234',
        clientId: 1,
        clientName: 'Constructora ABC',
        clientEmail: 'contacto@constructora.com',
        clientPhone: '+52 667 123 4567',
        items: [
            { productId: 1, productName: 'Basecoat Blanco', quantity: 10, price: 450, total: 4500 },
            { productId: 2, productName: 'Estuco Premium', quantity: 5, price: 380, total: 1900 }
        ],
        subtotal: 6400,
        tax: 1024,
        total: 7424,
        status: 'confirmed',
        paymentStatus: 'verified',
        paymentProof: 'comprobante_10234.pdf',
        deliveryDate: '2025-01-20',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        createdBy: 'vendedor'
    }
];

let quotes = [
    {
        id: 1,
        folio: 'COT-10235',
        clientId: 2,
        clientName: 'Ingeniería XYZ',
        clientEmail: 'ventas@ingenieria.com',
        clientPhone: '+52 667 987 6543',
        items: [
            { productId: 3, productName: 'Ultraforce', quantity: 8, price: 520, total: 4160 },
            { productId: 4, productName: 'Cellbond', quantity: 3, price: 680, total: 2040 }
        ],
        subtotal: 6200,
        tax: 992,
        total: 7192,
        status: 'pending',
        validUntil: '2025-01-25',
        paymentProof: null,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15'),
        createdBy: 'vendedor'
    }
];

let clients = [
    {
        id: 1,
        name: 'Constructora ABC',
        contact: 'Juan Pérez',
        email: 'contacto@constructora.com',
        phone: '+52 667 123 4567',
        address: 'Av. Principal 123, Culiacán',
        notes: 'Cliente preferencial',
        createdAt: new Date('2025-01-10'),
        status: 'active'
    },
    {
        id: 2,
        name: 'Ingeniería XYZ',
        contact: 'María García',
        email: 'ventas@ingenieria.com',
        phone: '+52 667 987 6543',
        address: 'Blvd. Emiliano Zapata 456, Culiacán',
        notes: 'Especialista en proyectos grandes',
        createdAt: new Date('2025-01-12'),
        status: 'active'
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

        // Obtener todos los pedidos
        if (method === 'GET' && path === '/api/orders') {
            return res.status(200).json({
                success: true,
                data: orders,
                total: orders.length
            });
        }

        // Obtener pedido por ID
        if (method === 'GET' && path.startsWith('/api/orders/')) {
            const orderId = parseInt(path.split('/')[3]);
            const order = orders.find(o => o.id === orderId);
            
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
                const { clientId, items, deliveryDate, notes } = req.body;
                
                // Calcular totales
                const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                const tax = subtotal * 0.16; // 16% IVA
                const total = subtotal + tax;

                const newOrder = {
                    id: orders.length + 1,
                    folio: `S35-${String(10000 + orders.length + 1).slice(-5)}`,
                    clientId,
                    clientName: clients.find(c => c.id === clientId)?.name || 'Cliente',
                    clientEmail: clients.find(c => c.id === clientId)?.email || '',
                    clientPhone: clients.find(c => c.id === clientId)?.phone || '',
                    items,
                    subtotal,
                    tax,
                    total,
                    status: 'confirmed',
                    paymentStatus: 'verified',
                    paymentProof: null,
                    deliveryDate,
                    notes,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: req.user.username
                };

                orders.push(newOrder);

                return res.status(201).json({
                    success: true,
                    message: 'Pedido creado exitosamente',
                    data: newOrder
                });
            });
        }

        // Actualizar estado de pedido
        if (method === 'PUT' && path.startsWith('/api/orders/')) {
            authenticateToken(req, res, () => {
                const orderId = parseInt(path.split('/')[3]);
                const orderIndex = orders.findIndex(o => o.id === orderId);
                
                if (orderIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Pedido no encontrado'
                    });
                }

                const { status, paymentStatus, paymentProof } = req.body;
                
                orders[orderIndex] = {
                    ...orders[orderIndex],
                    status: status || orders[orderIndex].status,
                    paymentStatus: paymentStatus || orders[orderIndex].paymentStatus,
                    paymentProof: paymentProof || orders[orderIndex].paymentProof,
                    updatedAt: new Date()
                };

                return res.status(200).json({
                    success: true,
                    message: 'Pedido actualizado exitosamente',
                    data: orders[orderIndex]
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
                const { clientId, items, validUntil, notes } = req.body;
                
                // Calcular totales
                const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                const tax = subtotal * 0.16; // 16% IVA
                const total = subtotal + tax;

                const newQuote = {
                    id: quotes.length + 1,
                    folio: `COT-${String(10000 + quotes.length + 1).slice(-5)}`,
                    clientId,
                    clientName: clients.find(c => c.id === clientId)?.name || 'Cliente',
                    clientEmail: clients.find(c => c.id === clientId)?.email || '',
                    clientPhone: clients.find(c => c.id === clientId)?.phone || '',
                    items,
                    subtotal,
                    tax,
                    total,
                    status: 'pending',
                    validUntil,
                    paymentProof: null,
                    notes,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: req.user.username
                };

                quotes.push(newQuote);

                return res.status(201).json({
                    success: true,
                    message: 'Cotización creada exitosamente',
                    data: newQuote
                });
            });
        }

        // Convertir cotización a pedido
        if (method === 'POST' && path.startsWith('/api/quotes/')) {
            authenticateToken(req, res, () => {
                const quoteId = parseInt(path.split('/')[3]);
                const quoteIndex = quotes.findIndex(q => q.id === quoteId);
                
                if (quoteIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cotización no encontrada'
                    });
                }

                const quote = quotes[quoteIndex];
                
                if (quote.status !== 'paid') {
                    return res.status(400).json({
                        success: false,
                        message: 'La cotización debe estar marcada como pagada para convertirla en pedido'
                    });
                }

                // Crear pedido desde cotización
                const newOrder = {
                    id: orders.length + 1,
                    folio: `S35-${String(10000 + orders.length + 1).slice(-5)}`,
                    clientId: quote.clientId,
                    clientName: quote.clientName,
                    clientEmail: quote.clientEmail,
                    clientPhone: quote.clientPhone,
                    items: quote.items,
                    subtotal: quote.subtotal,
                    tax: quote.tax,
                    total: quote.total,
                    status: 'confirmed',
                    paymentStatus: 'verified',
                    paymentProof: quote.paymentProof,
                    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 días
                    notes: quote.notes,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: req.user.username,
                    convertedFrom: quoteId
                };

                orders.push(newOrder);

                // Actualizar estado de cotización
                quotes[quoteIndex].status = 'converted';
                quotes[quoteIndex].updatedAt = new Date();

                return res.status(201).json({
                    success: true,
                    message: 'Cotización convertida a pedido exitosamente',
                    data: {
                        order: newOrder,
                        quote: quotes[quoteIndex]
                    }
                });
            });
        }

        // Subir comprobante de pago
        if (method === 'POST' && path.startsWith('/api/quotes/') && path.endsWith('/payment-proof')) {
            authenticateToken(req, res, () => {
                const quoteId = parseInt(path.split('/')[3]);
                const quoteIndex = quotes.findIndex(q => q.id === quoteId);
                
                if (quoteIndex === -1) {
                    return res.status(404).json({
                        success: false,
                        message: 'Cotización no encontrada'
                    });
                }

                const { paymentProof } = req.body;
                
                quotes[quoteIndex].paymentProof = paymentProof;
                quotes[quoteIndex].status = 'paid';
                quotes[quoteIndex].updatedAt = new Date();

                return res.status(200).json({
                    success: true,
                    message: 'Comprobante de pago subido exitosamente',
                    data: quotes[quoteIndex]
                });
            });
        }

        // Obtener clientes
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
                const { name, contact, email, phone, address, notes } = req.body;
                
                const newClient = {
                    id: clients.length + 1,
                    name,
                    contact,
                    email,
                    phone,
                    address,
                    notes,
                    createdAt: new Date(),
                    status: 'active'
                };

                clients.push(newClient);

                return res.status(201).json({
                    success: true,
                    message: 'Cliente creado exitosamente',
                    data: newClient
                });
            });
        }

        // Obtener estadísticas
        if (method === 'GET' && path === '/api/orders/stats') {
            const stats = {
                totalOrders: orders.length,
                pendingOrders: orders.filter(o => o.status === 'pending').length,
                confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
                deliveredOrders: orders.filter(o => o.status === 'delivered').length,
                totalQuotes: quotes.length,
                pendingQuotes: quotes.filter(q => q.status === 'pending').length,
                paidQuotes: quotes.filter(q => q.status === 'paid').length,
                totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
                todayRevenue: orders.filter(o => {
                    const today = new Date();
                    const orderDate = new Date(o.createdAt);
                    return orderDate.toDateString() === today.toDateString();
                }).reduce((sum, o) => sum + o.total, 0)
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
