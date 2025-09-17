// API endpoint para poblar la base de datos con productos S-35
const { getCollections, initializeDatabase } = require('./mongodb');
const { seedProducts } = require('./seed-products');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('🌱 Iniciando población de base de datos...');
        
        // Ejecutar el script de población
        await seedProducts();
        
        console.log('✅ Base de datos poblada exitosamente');
        
        return res.status(200).json({
            success: true,
            message: 'Base de datos poblada exitosamente con productos S-35',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error poblando base de datos:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Error poblando la base de datos',
            error: error.message
        });
    }
};
