// API para gestión de productos e inventario con MongoDB
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getCollections, initializeDatabase } = require('./mongodb');
const { validateDocument, schemas, buildSearchQuery, buildSortOptions } = require('./models');

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
        // Inicializar base de datos si es necesario
        await initializeDatabase();
        const collections = await getCollections();

        const { method, url } = req;
        const path = url.split('?')[0];
        const queryParams = new URLSearchParams(url.split('?')[1] || '');

        // Obtener todos los productos
        if (method === 'GET' && path === '/api/products') {
            const page = parseInt(queryParams.get('page')) || 1;
            const limit = parseInt(queryParams.get('limit')) || 50;
            const skip = (page - 1) * limit;
            
            const filters = {
                search: queryParams.get('search'),
                category: queryParams.get('category'),
                status: queryParams.get('status'),
                minPrice: queryParams.get('minPrice'),
                maxPrice: queryParams.get('maxPrice')
            };
            
            const sortBy = queryParams.get('sortBy') || 'createdAt';
            const sortOrder = queryParams.get('sortOrder') || 'desc';

            const searchQuery = buildSearchQuery(filters);
            const sortOptions = buildSortOptions(sortBy, sortOrder);

            const [products, total] = await Promise.all([
                collections.products
                    .find(searchQuery)
                    .sort(sortOptions)
                    .skip(skip)
                    .limit(limit)
                    .toArray(),
                collections.products.countDocuments(searchQuery)
            ]);

            return res.status(200).json({
                success: true,
                data: products,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            });
        }

        // Obtener producto por ID
        if (method === 'GET' && path.startsWith('/api/products/') && !path.includes('/stats') && !path.includes('/low-stock')) {
            const productId = path.split('/')[3];
            
            if (!ObjectId.isValid(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const product = await collections.products.findOne({ _id: new ObjectId(productId) });
            
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

        // Crear nuevo producto (solo PDC)
        if (method === 'POST' && path === '/api/products') {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({
                        success: false,
                        message: 'Solo administradores pueden crear productos'
                    });
                }

                const productData = {
                    ...req.body,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                // Validar datos
                const errors = validateDocument(schemas.product, productData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Verificar SKU único
                if (productData.sku) {
                    const existingProduct = await collections.products.findOne({ sku: productData.sku });
                    if (existingProduct) {
                        return res.status(400).json({
                            success: false,
                            message: 'El SKU ya existe'
                        });
                    }
                }

                // Verificar código de barras único
                if (productData.barcode) {
                    const existingProduct = await collections.products.findOne({ barcode: productData.barcode });
                    if (existingProduct) {
                        return res.status(400).json({
                            success: false,
                            message: 'El código de barras ya existe'
                        });
                    }
                }

                // Determinar estado basado en stock
                if (productData.stock <= 0) {
                    productData.status = 'out_of_stock';
                } else if (productData.stock <= productData.minStock) {
                    productData.status = 'low_stock';
                } else {
                    productData.status = 'active';
                }

                const result = await collections.products.insertOne(productData);
                const newProduct = await collections.products.findOne({ _id: result.insertedId });

                return res.status(201).json({
                    success: true,
                    message: 'Producto creado exitosamente',
                    data: newProduct
                });
            });
        }

        // Actualizar producto (solo PDC)
        if (method === 'PUT' && path.startsWith('/api/products/')) {
            authenticateToken(req, res, async () => {
                if (req.user.userType !== 'pdc') {
                    return res.status(403).json({
                        success: false,
                        message: 'Solo administradores pueden actualizar productos'
                    });
                }

                const productId = path.split('/')[3];
                
                if (!ObjectId.isValid(productId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID de producto inválido'
                    });
                }

                const existingProduct = await collections.products.findOne({ _id: new ObjectId(productId) });
                if (!existingProduct) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                const updateData = {
                    ...req.body,
                    updatedAt: new Date()
                };

                // Validar datos
                const errors = validateDocument(schemas.product, updateData);
                if (errors.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Datos inválidos',
                        errors
                    });
                }

                // Verificar SKU único (si se está cambiando)
                if (updateData.sku && updateData.sku !== existingProduct.sku) {
                    const existingSku = await collections.products.findOne({ 
                        sku: updateData.sku,
                        _id: { $ne: new ObjectId(productId) }
                    });
                    if (existingSku) {
                        return res.status(400).json({
                            success: false,
                            message: 'El SKU ya existe'
                        });
                    }
                }

                // Verificar código de barras único (si se está cambiando)
                if (updateData.barcode && updateData.barcode !== existingProduct.barcode) {
                    const existingBarcode = await collections.products.findOne({ 
                        barcode: updateData.barcode,
                        _id: { $ne: new ObjectId(productId) }
                    });
                    if (existingBarcode) {
                        return res.status(400).json({
                            success: false,
                            message: 'El código de barras ya existe'
                        });
                    }
                }

                // Determinar estado basado en stock
                const stock = updateData.stock !== undefined ? updateData.stock : existingProduct.stock;
                const minStock = updateData.minStock !== undefined ? updateData.minStock : existingProduct.minStock;
                
                if (stock <= 0) {
                    updateData.status = 'out_of_stock';
                } else if (stock <= minStock) {
                    updateData.status = 'low_stock';
                } else {
                    updateData.status = 'active';
                }

                await collections.products.updateOne(
                    { _id: new ObjectId(productId) },
                    { $set: updateData }
                );

                const updatedProduct = await collections.products.findOne({ _id: new ObjectId(productId) });

                return res.status(200).json({
                    success: true,
                    message: 'Producto actualizado exitosamente',
                    data: updatedProduct
                });
            });
        }

        // Actualizar stock (desde POS)
        if (method === 'POST' && path === '/api/products/update-stock') {
            authenticateToken(req, res, async () => {
                const { productId, quantity, operation, reason } = req.body;
                
                if (!ObjectId.isValid(productId)) {
                    return res.status(400).json({
                        success: false,
                        message: 'ID de producto inválido'
                    });
                }

                const product = await collections.products.findOne({ _id: new ObjectId(productId) });
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: 'Producto no encontrado'
                    });
                }

                const currentStock = product.stock;
                let newStock;

                if (operation === 'add') {
                    newStock = currentStock + parseInt(quantity);
                } else if (operation === 'subtract') {
                    newStock = currentStock - parseInt(quantity);
                    if (newStock < 0) {
                        return res.status(400).json({
                            success: false,
                            message: 'Stock insuficiente'
                        });
                    }
                } else if (operation === 'adjust') {
                    newStock = parseInt(quantity);
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Operación inválida'
                    });
                }

                // Determinar nuevo estado
                let newStatus = 'active';
                if (newStock <= 0) {
                    newStatus = 'out_of_stock';
                } else if (newStock <= product.minStock) {
                    newStatus = 'low_stock';
                }

                // Actualizar producto
                await collections.products.updateOne(
                    { _id: new ObjectId(productId) },
                    { 
                        $set: { 
                            stock: newStock,
                            status: newStatus,
                            updatedAt: new Date()
                        }
                    }
                );

                // Registrar movimiento de inventario
                await collections.inventory.insertOne({
                    productId: new ObjectId(productId),
                    productName: product.name,
                    operation,
                    quantity: parseInt(quantity),
                    previousStock: currentStock,
                    newStock,
                    reason: reason || 'Actualización manual',
                    reference: req.body.reference || null,
                    performedBy: req.user.username,
                    createdAt: new Date()
                });

                return res.status(200).json({
                    success: true,
                    message: 'Stock actualizado exitosamente',
                    data: {
                        productId,
                        oldStock: currentStock,
                        newStock,
                        status: newStatus
                    }
                });
            });
        }

        // Obtener productos con stock bajo
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

        // Obtener estadísticas de productos
        if (method === 'GET' && path === '/api/products/stats') {
            const stats = await collections.products.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                        lowStock: { $sum: { $cond: [{ $eq: ['$status', 'low_stock'] }, 1, 0] } },
                        outOfStock: { $sum: { $cond: [{ $eq: ['$status', 'out_of_stock'] }, 1, 0] } },
                        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
                        avgPrice: { $avg: '$price' },
                        totalStock: { $sum: '$stock' }
                    }
                }
            ]).toArray();

            const result = stats[0] || {
                total: 0,
                active: 0,
                lowStock: 0,
                outOfStock: 0,
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