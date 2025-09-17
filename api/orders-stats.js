// api/orders-stats.js - Estadísticas de pedidos y ventas
const { getCollections } = require('./mongodb');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Si MongoDB no está configurado, usar datos simulados
        if (!process.env.MONGODB_URI) {
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

        // Usar MongoDB si está configurado
        const { orders, quotes, clients } = await getCollections();

        // Estadísticas básicas
        const totalOrders = await orders.countDocuments();
        const totalQuotes = await quotes.countDocuments();
        const totalClients = await clients.countDocuments();

        // Calcular ingresos totales
        const revenueResult = await orders.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
        ]).toArray();
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalAmount : 0;

        // Pedidos recientes
        const recentOrders = await orders.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        // Cotizaciones recientes
        const recentQuotes = await quotes.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        const stats = {
            totalOrders,
            totalQuotes,
            totalClients,
            totalRevenue,
            recentOrders,
            recentQuotes
        };

        return res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error en orders-stats API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};
