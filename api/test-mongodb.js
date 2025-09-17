// api/test-mongodb.js - Probar conexión a MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        console.log('MONGODB_URI configurada:', !!process.env.MONGODB_URI);
        console.log('MONGODB_URI length:', process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0);
        
        if (!process.env.MONGODB_URI) {
            return res.status(200).json({
                success: false,
                message: 'MONGODB_URI no está configurada',
                mongodb_uri_configured: false
            });
        }

        // Intentar conectar a MongoDB
        const client = new MongoClient(process.env.MONGODB_URI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

        await client.connect();
        await client.db("admin").command({ ping: 1 });
        
        // Listar bases de datos
        const adminDb = client.db("admin");
        const dbs = await adminDb.admin().listDatabases();
        
        await client.close();

        return res.status(200).json({
            success: true,
            message: 'Conexión a MongoDB exitosa',
            mongodb_uri_configured: true,
            databases: dbs.databases.map(db => db.name)
        });

    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        return res.status(500).json({
            success: false,
            message: 'Error conectando a MongoDB',
            error: error.message,
            mongodb_uri_configured: !!process.env.MONGODB_URI
        });
    }
};
