// api/test-routes.js - Probar rutas específicas
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { method, url } = req;
    const path = url.split('?')[0];

    // GET /api/test-routes - Información del sistema
    if (method === 'GET' && path === '/api/test-routes') {
        return res.status(200).json({
            success: true,
            message: 'Test routes funcionando',
            method: method,
            url: url,
            path: path,
            timestamp: new Date().toISOString()
        });
    }

    // GET /api/test-routes/orders/stats - Estadísticas de prueba
    if (method === 'GET' && path === '/api/test-routes/orders/stats') {
        return res.status(200).json({
            success: true,
            data: {
                totalOrders: 45,
                totalQuotes: 23,
                totalClients: 12,
                totalRevenue: 245680
            }
        });
    }

    return res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: path
    });
};
