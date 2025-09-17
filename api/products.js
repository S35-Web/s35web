// api/products.js - Endpoint específico de productos
const jwt = require('jsonwebtoken');

// Datos de productos
let products = [
    {
        _id: '1',
        name: 'Basecoat Blanco Absoluto',
        category: 'Base',
        price: 450,
        stock: 150,
        minStock: 20,
        description: 'Base para estuco de alta calidad',
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
        description: 'Estuco de acabado premium',
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
        description: 'Adhesivo de ultra fuerza',
        image: 'ultraforce.png',
        sku: 'ADH-ULTRA-001',
        status: 'low_stock',
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
        // GET /api/products - Obtener productos
        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                data: products,
                total: products.length
            });
        }

        // POST /api/products - Crear producto
        if (req.method === 'POST') {
            authenticateToken(req, res, () => {
                const newProduct = JSON.parse(req.body);
                newProduct._id = (products.length + 1).toString();
                newProduct.createdAt = new Date();
                newProduct.updatedAt = new Date();
                newProduct.status = newProduct.stock > newProduct.minStock ? 'active' : 'low_stock';
                products.push(newProduct);
                
                return res.status(201).json({
                    success: true,
                    message: 'Producto creado exitosamente',
                    data: newProduct
                });
            });
        }

        return res.status(405).json({
            success: false,
            message: 'Método no permitido'
        });

    } catch (error) {
        console.error('Error en products API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};