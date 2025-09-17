// API simplificada de productos sin MongoDB
const jwt = require('jsonwebtoken');

// Base de datos simulada
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
    },
    {
        _id: '4',
        name: 'Cellbond',
        category: 'Adhesivo',
        price: 680,
        stock: 45,
        minStock: 15,
        description: 'Adhesivo celular de alta resistencia para construcción',
        image: 'cellbond.png',
        sku: 'ADH-CELL-001',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        _id: '5',
        name: 'WAXTARD Blanco Absoluto',
        category: 'Premium',
        price: 650,
        stock: 40,
        minStock: 10,
        description: 'Línea premium WAXTARD en blanco absoluto',
        image: 'WAXTARD-BLANCO-ABSOLUTO.png',
        sku: 'WAX-BLANCO-ABS-001',
        status: 'active',
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

        // Obtener todos los productos
        if (method === 'GET' && path === '/api/products') {
            return res.status(200).json({
                success: true,
                data: products,
                total: products.length
            });
        }

        // Obtener producto por ID
        if (method === 'GET' && path.startsWith('/api/products/') && !path.includes('/stats') && !path.includes('/low-stock')) {
            const productId = path.split('/')[3];
            const product = products.find(p => p._id === productId);
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            return res.status(200).json({
                success: true,
                data: product
            });
        }

        // Obtener productos con stock bajo
        if (method === 'GET' && path === '/api/products/low-stock') {
            const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.status !== 'out_of_stock');
            
            return res.status(200).json({
                success: true,
                data: lowStockProducts,
                total: lowStockProducts.length
            });
        }

        // Obtener estadísticas de productos
        if (method === 'GET' && path === '/api/products/stats') {
            const stats = {
                total: products.length,
                active: products.filter(p => p.status === 'active').length,
                lowStock: products.filter(p => p.status === 'low_stock').length,
                outOfStock: products.filter(p => p.status === 'out_of_stock').length,
                totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
                avgPrice: products.reduce((sum, p) => sum + p.price, 0) / products.length,
                totalStock: products.reduce((sum, p) => sum + p.stock, 0)
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
        console.error('Error en products API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};
