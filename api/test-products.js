// api/test-products.js - API de prueba para productos
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('=== TEST PRODUCTS API ===');
        console.log('Method:', req.method);
        console.log('URL:', req.url);
        console.log('Body type:', typeof req.body);
        console.log('Body content:', req.body);
        console.log('Headers:', req.headers);

        if (req.method === 'GET') {
            return res.status(200).json({
                success: true,
                message: 'API de productos funcionando',
                data: [
                    {
                        _id: '1',
                        name: 'Producto Test',
                        price: 100,
                        category: 'Base',
                        stock: 10
                    }
                ]
            });
        }

        if (req.method === 'POST') {
            // Crear producto
            const body = req.body || {};
            console.log('Creating product with body:', body);

            const newProduct = {
                _id: Date.now().toString(),
                name: body.name || 'Producto Test',
                description: body.description || '',
                price: body.price || 0,
                cost: body.cost || 0,
                category: body.category || 'Base',
                sku: body.sku || `SKU-${Date.now()}`,
                stock: body.stock || 0,
                minStock: body.minStock || 0,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            return res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: newProduct
            });
        }

        return res.status(405).json({
            success: false,
            message: 'Método no permitido'
        });

    } catch (error) {
        console.error('Error in test products API:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};
