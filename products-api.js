// products-api.js - API de productos simple
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Datos de productos S-35
        const products = [
            {
                _id: '1',
                name: 'Basecoat Blanco Absoluto',
                category: 'Base',
                price: 450,
                stock: 150,
                minStock: 20,
                description: 'Base para estuco de alta calidad, color blanco absoluto',
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
                description: 'Estuco de acabado premium para interiores y exteriores',
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
                description: 'Adhesivo de ultra fuerza para materiales pesados',
                image: 'ultraforce.png',
                sku: 'ADH-ULTRA-001',
                status: 'low_stock',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        return res.status(200).json({
            success: true,
            data: products,
            total: products.length,
            message: 'Productos S-35 cargados exitosamente'
        });

    } catch (error) {
        console.error('Error en products API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
