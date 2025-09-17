// api/quotes.js - API de cotizaciones
const { getCollections } = require('./mongodb');
const { validateDocument } = require('./models');
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

        // Si MongoDB no está configurado, usar datos simulados
        if (!process.env.MONGODB_URI) {
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
                },
                {
                    _id: '3',
                    clientId: '3',
                    clientName: 'Arquitectura Moderna',
                    items: [
                        {
                            productId: '4',
                            productName: 'Cellbond',
                            quantity: 8,
                            price: 680
                        },
                        {
                            productId: '5',
                            productName: 'WAXTARD Blanco Absoluto',
                            quantity: 12,
                            price: 650
                        }
                    ],
                    totalAmount: 15040,
                    status: 'pending',
                    orderType: 'quote',
                    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
                }
            ];

            // GET /api/quotes - Obtener todas las cotizaciones
            if (method === 'GET' && path === '/api/quotes') {
                return res.status(200).json({
                    success: true,
                    data: mockQuotes,
                    total: mockQuotes.length
                });
            }

            // GET /api/quotes/:id - Obtener cotización por ID
            if (method === 'GET' && path.startsWith('/api/quotes/')) {
                const quoteId = path.split('/')[3];
                const quote = mockQuotes.find(q => q._id === quoteId);
                
                if (!quote) {
                    return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
                }
                
                return res.status(200).json({ success: true, data: quote });
            }

            // POST /api/quotes - Crear nueva cotización
            if (method === 'POST' && path === '/api/quotes') {
                const newQuote = JSON.parse(req.body);
                newQuote._id = (mockQuotes.length + 1).toString();
                newQuote.createdAt = new Date();
                newQuote.updatedAt = new Date();
                newQuote.status = 'pending';
                newQuote.orderType = 'quote';
                
                mockQuotes.push(newQuote);
                
                return res.status(201).json({
                    success: true,
                    message: 'Cotización creada exitosamente',
                    data: newQuote
                });
            }

            // POST /api/quotes/:id/payment-proof - Subir comprobante de pago
            if (method === 'POST' && path.includes('/payment-proof')) {
                const quoteId = path.split('/')[3];
                const quote = mockQuotes.find(q => q._id === quoteId);
                
                if (!quote) {
                    return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
                }
                
                const { paymentProofUrl } = JSON.parse(req.body);
                quote.paymentProof = paymentProofUrl;
                quote.status = 'payment_received';
                quote.updatedAt = new Date();
                
                return res.status(200).json({
                    success: true,
                    message: 'Comprobante de pago subido exitosamente',
                    data: quote
                });
            }

            // POST /api/quotes/:id - Convertir cotización a pedido
            if (method === 'POST' && path.startsWith('/api/quotes/') && !path.includes('/payment-proof')) {
                const quoteId = path.split('/')[3];
                const quoteIndex = mockQuotes.findIndex(q => q._id === quoteId);
                
                if (quoteIndex === -1) {
                    return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
                }
                
                const quote = mockQuotes[quoteIndex];
                const convertedOrder = {
                    ...quote,
                    _id: (Date.now()).toString(),
                    orderType: 'order',
                    status: 'processing',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                
                // Eliminar cotización después de convertir
                mockQuotes.splice(quoteIndex, 1);
                
                return res.status(200).json({
                    success: true,
                    message: 'Cotización convertida a pedido exitosamente',
                    data: convertedOrder
                });
            }

            return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
        }

        // Usar MongoDB si está configurado
        const { quotes, orders, clients } = await getCollections();

        // GET /api/quotes - Obtener todas las cotizaciones
        if (method === 'GET' && path === '/api/quotes') {
            const allQuotes = await quotes.find({}).toArray();
            return res.status(200).json({ success: true, data: allQuotes, total: allQuotes.length });
        }

        // GET /api/quotes/:id - Obtener cotización por ID
        if (method === 'GET' && path.startsWith('/api/quotes/')) {
            const quoteId = path.split('/')[3];
            if (!ObjectId.isValid(quoteId)) {
                return res.status(400).json({ success: false, message: 'ID de cotización inválido' });
            }
            const quote = await quotes.findOne({ _id: new ObjectId(quoteId) });
            if (!quote) {
                return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
            }
            return res.status(200).json({ success: true, data: quote });
        }

        // POST /api/quotes - Crear nueva cotización
        if (method === 'POST' && path === '/api/quotes') {
            authenticateToken(req, res, async () => {
                const newQuoteData = JSON.parse(req.body);
                const errors = validateDocument('order', newQuoteData);
                if (errors.length > 0) {
                    return res.status(400).json({ success: false, message: 'Datos de cotización inválidos', errors });
                }
                newQuoteData.createdAt = new Date();
                newQuoteData.updatedAt = new Date();
                newQuoteData.orderType = 'quote';
                newQuoteData.status = 'pending';
                const result = await quotes.insertOne(newQuoteData);
                return res.status(201).json({ success: true, data: { _id: result.insertedId, ...newQuoteData } });
            });
        }

        // POST /api/quotes/:id/payment-proof - Subir comprobante de pago
        if (method === 'POST' && path.includes('/payment-proof')) {
            authenticateToken(req, res, async () => {
                const quoteId = path.split('/')[3];
                if (!ObjectId.isValid(quoteId)) {
                    return res.status(400).json({ success: false, message: 'ID de cotización inválido' });
                }
                const { paymentProofUrl } = JSON.parse(req.body);
                const result = await quotes.findOneAndUpdate(
                    { _id: new ObjectId(quoteId) },
                    { $set: { paymentProof: paymentProofUrl, status: 'payment_received', updatedAt: new Date() } },
                    { returnDocument: 'after' }
                );
                if (!result.value) {
                    return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
                }
                return res.status(200).json({ success: true, data: result.value });
            });
        }

        // POST /api/quotes/:id - Convertir cotización a pedido
        if (method === 'POST' && path.startsWith('/api/quotes/') && !path.includes('/payment-proof')) {
            authenticateToken(req, res, async () => {
                const quoteId = path.split('/')[3];
                if (!ObjectId.isValid(quoteId)) {
                    return res.status(400).json({ success: false, message: 'ID de cotización inválido' });
                }
                const quote = await quotes.findOne({ _id: new ObjectId(quoteId) });
                if (!quote) {
                    return res.status(404).json({ success: false, message: 'Cotización no encontrada' });
                }
                const convertedOrder = { ...quote, orderType: 'order', status: 'processing', createdAt: new Date(), updatedAt: new Date() };
                delete convertedOrder._id;
                const orderResult = await orders.insertOne(convertedOrder);
                await quotes.deleteOne({ _id: new ObjectId(quoteId) });
                return res.status(200).json({ success: true, data: { _id: orderResult.insertedId, ...convertedOrder } });
            });
        }

        return res.status(404).json({ success: false, message: 'Ruta no encontrada' });

    } catch (error) {
        console.error('Error en quotes API:', error);
        return res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
    }
};
