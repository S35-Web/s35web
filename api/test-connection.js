// API endpoint para probar la conexión a MongoDB
const { getCollections, initializeDatabase } = require('./mongodb');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('🔍 Probando conexión a MongoDB...');
        
        // Inicializar base de datos
        await initializeDatabase();
        const collections = await getCollections();
        
        // Contar productos
        const productCount = await collections.products.countDocuments();
        
        console.log(`✅ Conexión exitosa. Productos en DB: ${productCount}`);
        
        return res.status(200).json({
            success: true,
            message: 'Conexión a MongoDB exitosa',
            data: {
                connected: true,
                productCount: productCount,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error de conexión a MongoDB:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Error de conexión a MongoDB',
            error: error.message,
            data: {
                connected: false,
                timestamp: new Date().toISOString()
            }
        });
    }
};
