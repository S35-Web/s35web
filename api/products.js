// api/products.js - API de productos con MongoDB
const jwt = require('jsonwebtoken');
const { getCollections } = require('./mongodb');
const { validateDocument, buildSearchQuery, buildSortOptions } = require('./models');

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

// Función para actualizar el estado del producto basado en stock
function updateProductStatus(product) {
    if (product.stock <= 0) {
        product.status = 'out_of_stock';
    } else if (product.stock <= product.minStock) {
        product.status = 'low_stock';
    } else {
        product.status = 'active';
    }
    return product;
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

        // GET /api/products - Obtener todos los productos con filtros
        if (method === 'GET' && path === '/api/products') {
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 50;
            const search = queryParams.get('search') || '';
            const category = queryParams.get('category') || '';
            const status = queryParams.get('status') || '';
            const sortBy = queryParams.get('sortBy') || 'name';
            const sortOrder = queryParams.get('sortOrder') || 'asc';

            // Construir query de búsqueda
            const query = buildSearchQuery({ search, category, status });
            const sortOptions = buildSortOptions(sortBy, sortOrder);

            // Ejecutar consulta con paginación
            const skip = (page - 1) * limit;
            const products = await collections.products
                .find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await collections.products.countDocuments(query);

            return res.status(200).json({
                success: true,
                data: products,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        }

        // GET /api/products/:id - Obtener producto por ID
        if (method === 'GET' && path.startsWith('/api/products/') && !path.includes('/stats') && !path.includes('/low-stock')) {
            const productId = path.split('/')[3];
            const product = await collections.products.findOne({ _id: productId });

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

        // POST /api/products - Crear nuevo producto (solo PDC)
        if (method === 'POST' && path === '/api/products') {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Solo el PDC puede crear productos' 
                    });
                }

                const productData = JSON.parse(req.body);
                
                // Validar datos
                const errors = validateDocument('product', productData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Verificar que el SKU no exista
                const existingProduct = await collections.products.findOne({ sku: productData.sku });
                if (existingProduct) {
                    return res.status(400).json({
                        success: false,
                        message: 'El SKU ya existe'
                    });
                }

                // Preparar datos del producto
                const newProduct = {
                    ...productData,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Actualizar estado basado en stock
                updateProductStatus(newProduct);

                // Insertar en la base de datos
                const result = await collections.products.insertOne(newProduct);
                newProduct._id = result.insertedId;

                return res.status(201).json({
                    success: true,
                    data: newProduct
                });
            });
        }

        // PUT /api/products/:id - Actualizar producto (solo PDC)
        if (method === 'PUT' && path.startsWith('/api/products/')) {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({ 
                        success: false, 
                        message: 'Solo el PDC puede actualizar productos' 
                    });
                }

                const productId = path.split('/')[3];
                const updateData = JSON.parse(req.body);

                // Validar datos
                const errors = validateDocument('product', updateData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Verificar que el producto existe
                const existingProduct = await collections.products.findOne({ _id: productId });
                if (!existingProduct) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                // Preparar datos de actualización
                const updatedProduct = {
                    ...updateData,
                    updatedAt: new Date()
                };

                // Actualizar estado basado en stock
                updateProductStatus(updatedProduct);

                // Actualizar en la base de datos
                await collections.products.updateOne(
                    { _id: productId },
                    { $set: updatedProduct }
                );

                return res.status(200).json({
                    success: true,
                    data: updatedProduct
                });
            });
        }

        // POST /api/products/update-stock - Actualizar stock
        if (method === 'POST' && path === '/api/products/update-stock') {
            authenticateToken(req, res, async () => {
                const { productId, quantityChange, reason } = JSON.parse(req.body);

                const product = await collections.products.findOne({ _id: productId });
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                // Actualizar stock
                const newStock = product.stock + quantityChange;
                if (newStock < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Stock insuficiente'
                    });
                }

                const updatedProduct = {
                    ...product,
                    stock: newStock,
                    updatedAt: new Date()
                };

                // Actualizar estado basado en stock
                updateProductStatus(updatedProduct);

                // Actualizar en la base de datos
                await collections.products.updateOne(
                    { _id: productId },
                    { $set: updatedProduct }
                );

                // Registrar movimiento de inventario
                await collections.inventory.insertOne({
                    productId,
                    productName: product.name,
                    quantityChange,
                    newStock,
                    reason: reason || 'Ajuste manual',
                    userId: req.user.userId,
                    createdAt: new Date()
                });

                return res.status(200).json({
                    success: true,
                    data: updatedProduct
                });
            });
        }

        // GET /api/products/low-stock - Productos con stock bajo
        if (method === 'GET' && path === '/api/products/low-stock') {
            const lowStockProducts = await collections.products
                .find({ 
                    $expr: { $lte: ['$stock', '$minStock'] },
                    status: { $ne: 'out_of_stock' }
                })
                .toArray();

            return res.status(200).json({
                success: true,
                data: lowStockProducts,
                total: lowStockProducts.length
            });
        }

        // GET /api/products/stats - Estadísticas de productos
        if (method === 'GET' && path === '/api/products/stats') {
            const pipeline = [
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        activeProducts: {
                            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                        },
                        lowStockProducts: {
                            $sum: { $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0] }
                        },
                        outOfStockProducts: {
                            $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] }
                        },
                        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
                        avgPrice: { $avg: '$price' },
                        totalStock: { $sum: '$stock' }
                    }
                }
            ];

            const stats = await collections.products.aggregate(pipeline).toArray();
            const result = stats[0] || {
                totalProducts: 0,
                activeProducts: 0,
                lowStockProducts: 0,
                outOfStockProducts: 0,
                totalValue: 0,
                avgPrice: 0,
                totalStock: 0
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
        console.error('Error en products API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};