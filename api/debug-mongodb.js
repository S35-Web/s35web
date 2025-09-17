// api/debug-mongodb.js - Debug detallado de MongoDB
module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const mongodbUri = process.env.MONGODB_URI;
        
        return res.status(200).json({
            success: true,
            debug: {
                mongodb_uri_exists: !!mongodbUri,
                mongodb_uri_length: mongodbUri ? mongodbUri.length : 0,
                mongodb_uri_starts_with: mongodbUri ? mongodbUri.substring(0, 20) + '...' : 'No configurado',
                node_version: process.version,
                environment: process.env.NODE_ENV || 'development'
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
