// API para reportes de ventas avanzados
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getCollections, initializeDatabase } = require('./mongodb');

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
        await initializeDatabase();
        const collections = await getCollections();

        const { method, url } = req;
        const path = url.split('?')[0];
        const queryParams = new URLSearchParams(url.split('?')[1] || '');

        // Obtener parámetros de fecha
        const startDate = queryParams.get('startDate') || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
        const endDate = queryParams.get('endDate') || new Date().toISOString().split('T')[0];
        const groupBy = queryParams.get('groupBy') || 'day'; // day, week, month, year
        const userId = queryParams.get('userId');

        const dateFilter = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate + 'T23:59:59.999Z')
            }
        };

        // Reporte de ventas por período
        if (method === 'GET' && path === '/api/sales-reports/period') {
            authenticateToken(req, res, async () => {
                const pipeline = [
                    { $match: dateFilter },
                    {
                        $group: {
                            _id: getGroupByExpression(groupBy),
                            totalSales: { $sum: '$total' },
                            totalOrders: { $sum: 1 },
                            avgOrderValue: { $avg: '$total' },
                            orders: { $push: '$$ROOT' }
                        }
                    },
                    { $sort: { _id: 1 } }
                ];

                const salesData = await collections.orders.aggregate(pipeline).toArray();

                // Calcular crecimiento
                const growthData = salesData.map((item, index) => {
                    const previousValue = index > 0 ? salesData[index - 1].totalSales : 0;
                    const growth = previousValue > 0 ? ((item.totalSales - previousValue) / previousValue) * 100 : 0;
                    
                    return {
                        ...item,
                        growth: Math.round(growth * 100) / 100
                    };
                });

                return res.status(200).json({
                    success: true,
                    data: {
                        period: { startDate, endDate, groupBy },
                        sales: growthData,
                        summary: {
                            totalRevenue: salesData.reduce((sum, item) => sum + item.totalSales, 0),
                            totalOrders: salesData.reduce((sum, item) => sum + item.totalOrders, 0),
                            avgOrderValue: salesData.length > 0 ? salesData.reduce((sum, item) => sum + item.avgOrderValue, 0) / salesData.length : 0
                        }
                    }
                });
            });
        }

        // Reporte de productos más vendidos
        if (method === 'GET' && path === '/api/sales-reports/top-products') {
            authenticateToken(req, res, async () => {
                const limit = parseInt(queryParams.get('limit')) || 10;

                const pipeline = [
                    { $match: dateFilter },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.productId',
                            productName: { $first: '$items.productName' },
                            totalQuantity: { $sum: '$items.quantity' },
                            totalRevenue: { $sum: '$items.total' },
                            orderCount: { $sum: 1 },
                            avgPrice: { $avg: '$items.price' }
                        }
                    },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: limit }
                ];

                const topProducts = await collections.orders.aggregate(pipeline).toArray();

                return res.status(200).json({
                    success: true,
                    data: {
                        period: { startDate, endDate },
                        topProducts,
                        summary: {
                            totalProductsSold: topProducts.reduce((sum, item) => sum + item.totalQuantity, 0),
                            totalRevenue: topProducts.reduce((sum, item) => sum + item.totalRevenue, 0)
                        }
                    }
                });
            });
        }

        // Reporte de clientes
        if (method === 'GET' && path === '/api/sales-reports/clients') {
            authenticateToken(req, res, async () => {
                const pipeline = [
                    { $match: dateFilter },
                    {
                        $group: {
                            _id: '$clientId',
                            clientName: { $first: '$clientName' },
                            totalOrders: { $sum: 1 },
                            totalSpent: { $sum: '$total' },
                            avgOrderValue: { $avg: '$total' },
                            lastOrder: { $max: '$createdAt' }
                        }
                    },
                    { $sort: { totalSpent: -1 } }
                ];

                const clientStats = await collections.orders.aggregate(pipeline).toArray();

                // Clasificar clientes
                const totalRevenue = clientStats.reduce((sum, client) => sum + client.totalSpent, 0);
                const classifiedClients = clientStats.map(client => {
                    const percentage = (client.totalSpent / totalRevenue) * 100;
                    let category = 'Bronce';
                    if (percentage >= 20) category = 'Oro';
                    else if (percentage >= 10) category = 'Plata';
                    
                    return {
                        ...client,
                        category,
                        percentage: Math.round(percentage * 100) / 100
                    };
                });

                return res.status(200).json({
                    success: true,
                    data: {
                        period: { startDate, endDate },
                        clients: classifiedClients,
                        summary: {
                            totalClients: clientStats.length,
                            totalRevenue,
                            goldClients: classifiedClients.filter(c => c.category === 'Oro').length,
                            silverClients: classifiedClients.filter(c => c.category === 'Plata').length,
                            bronzeClients: classifiedClients.filter(c => c.category === 'Bronce').length
                        }
                    }
                });
            });
        }

        // Reporte de vendedores
        if (method === 'GET' && path === '/api/sales-reports/sales-reps') {
            authenticateToken(req, res, async () => {
                const pipeline = [
                    { $match: dateFilter },
                    {
                        $group: {
                            _id: '$createdBy',
                            totalOrders: { $sum: 1 },
                            totalRevenue: { $sum: '$total' },
                            avgOrderValue: { $avg: '$total' },
                            uniqueClients: { $addToSet: '$clientId' }
                        }
                    },
                    {
                        $addFields: {
                            uniqueClientCount: { $size: '$uniqueClients' }
                        }
                    },
                    { $sort: { totalRevenue: -1 } }
                ];

                const salesReps = await collections.orders.aggregate(pipeline).toArray();

                return res.status(200).json({
                    success: true,
                    data: {
                        period: { startDate, endDate },
                        salesReps: salesReps.map(rep => ({
                            ...rep,
                            conversionRate: rep.totalOrders > 0 ? Math.round((rep.uniqueClientCount / rep.totalOrders) * 100) : 0
                        })),
                        summary: {
                            totalSalesReps: salesReps.length,
                            totalRevenue: salesReps.reduce((sum, rep) => sum + rep.totalRevenue, 0),
                            avgRevenuePerRep: salesReps.length > 0 ? salesReps.reduce((sum, rep) => sum + rep.totalRevenue, 0) / salesReps.length : 0
                        }
                    }
                });
            });
        }

        // Reporte de inventario
        if (method === 'GET' && path === '/api/sales-reports/inventory') {
            authenticateToken(req, res, async () => {
                // Productos con stock bajo
                const lowStockProducts = await collections.products
                    .find({ 
                        $expr: { $lte: ['$stock', '$minStock'] },
                        status: { $ne: 'out_of_stock' }
                    })
                    .toArray();

                // Productos más vendidos vs stock
                const topSellingProducts = await collections.orders.aggregate([
                    { $match: dateFilter },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.productId',
                            productName: { $first: '$items.productName' },
                            totalSold: { $sum: '$items.quantity' },
                            totalRevenue: { $sum: '$items.total' }
                        }
                    },
                    { $sort: { totalSold: -1 } },
                    { $limit: 10 }
                ]).toArray();

                // Obtener información de stock de productos más vendidos
                const productIds = topSellingProducts.map(p => new ObjectId(p._id));
                const stockInfo = await collections.products
                    .find({ _id: { $in: productIds } })
                    .toArray();

                const stockAnalysis = topSellingProducts.map(product => {
                    const stockData = stockInfo.find(s => s._id.toString() === product._id);
                    return {
                        ...product,
                        currentStock: stockData?.stock || 0,
                        minStock: stockData?.minStock || 0,
                        status: stockData?.status || 'unknown',
                        daysOfStock: stockData?.stock > 0 ? Math.round(stockData.stock / (product.totalSold / 30)) : 0
                    };
                });

                return res.status(200).json({
                    success: true,
                    data: {
                        period: { startDate, endDate },
                        lowStockProducts,
                        stockAnalysis,
                        summary: {
                            lowStockCount: lowStockProducts.length,
                            outOfStockCount: await collections.products.countDocuments({ status: 'out_of_stock' }),
                            totalProducts: await collections.products.countDocuments({}),
                            totalValue: await collections.products.aggregate([
                                { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } }
                            ]).toArray().then(result => result[0]?.total || 0)
                        }
                    }
                });
            });
        }

        // Dashboard resumen
        if (method === 'GET' && path === '/api/sales-reports/dashboard') {
            authenticateToken(req, res, async () => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const lastMonth = new Date(today);
                lastMonth.setMonth(lastMonth.getMonth() - 1);

                const [
                    todayStats,
                    yesterdayStats,
                    lastMonthStats,
                    topProducts,
                    recentOrders,
                    lowStockCount
                ] = await Promise.all([
                    // Ventas de hoy
                    collections.orders.aggregate([
                        { $match: { createdAt: { $gte: new Date(today.toDateString()) } } },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: '$total' },
                                totalOrders: { $sum: 1 }
                            }
                        }
                    ]).toArray(),
                    
                    // Ventas de ayer
                    collections.orders.aggregate([
                        { 
                            $match: { 
                                createdAt: { 
                                    $gte: new Date(yesterday.toDateString()),
                                    $lt: new Date(today.toDateString())
                                } 
                            } 
                        },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: '$total' },
                                totalOrders: { $sum: 1 }
                            }
                        }
                    ]).toArray(),
                    
                    // Ventas del mes pasado
                    collections.orders.aggregate([
                        { $match: { createdAt: { $gte: lastMonth, $lt: new Date(today.getFullYear(), today.getMonth(), 1) } } },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: '$total' },
                                totalOrders: { $sum: 1 }
                            }
                        }
                    ]).toArray(),
                    
                    // Top 5 productos
                    collections.orders.aggregate([
                        { $match: dateFilter },
                        { $unwind: '$items' },
                        {
                            $group: {
                                _id: '$items.productName',
                                totalSold: { $sum: '$items.quantity' },
                                totalRevenue: { $sum: '$items.total' }
                            }
                        },
                        { $sort: { totalSold: -1 } },
                        { $limit: 5 }
                    ]).toArray(),
                    
                    // Pedidos recientes
                    collections.orders
                        .find({})
                        .sort({ createdAt: -1 })
                        .limit(5)
                        .toArray(),
                    
                    // Productos con stock bajo
                    collections.products.countDocuments({ 
                        $expr: { $lte: ['$stock', '$minStock'] },
                        status: { $ne: 'out_of_stock' }
                    })
                ]);

                const todayData = todayStats[0] || { totalRevenue: 0, totalOrders: 0 };
                const yesterdayData = yesterdayStats[0] || { totalRevenue: 0, totalOrders: 0 };
                const lastMonthData = lastMonthStats[0] || { totalRevenue: 0, totalOrders: 0 };

                const todayGrowth = yesterdayData.totalRevenue > 0 
                    ? ((todayData.totalRevenue - yesterdayData.totalRevenue) / yesterdayData.totalRevenue) * 100 
                    : 0;

                return res.status(200).json({
                    success: true,
                    data: {
                        kpis: {
                            todayRevenue: todayData.totalRevenue,
                            todayOrders: todayData.totalOrders,
                            todayGrowth: Math.round(todayGrowth * 100) / 100,
                            lastMonthRevenue: lastMonthData.totalRevenue,
                            lowStockProducts: lowStockCount
                        },
                        topProducts,
                        recentOrders: recentOrders.map(order => ({
                            folio: order.folio,
                            clientName: order.clientName,
                            total: order.total,
                            status: order.status,
                            createdAt: order.createdAt
                        })),
                        period: { startDate, endDate }
                    }
                });
            });
        }

        // Ruta no encontrada
        return res.status(404).json({
            success: false,
            message: 'Ruta no encontrada'
        });

    } catch (error) {
        console.error('Error en sales-reports API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Función auxiliar para agrupar por período
function getGroupByExpression(groupBy) {
    switch (groupBy) {
        case 'day':
            return {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
        case 'week':
            return {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
        case 'month':
            return {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
        case 'year':
            return {
                year: { $year: '$createdAt' }
            };
        default:
            return {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
    }
}
