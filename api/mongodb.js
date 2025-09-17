// Configuración de MongoDB
const { MongoClient } = require('mongodb');

let client = null;
let db = null;

// URI de conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://s35user:s35password@s35cluster.mongodb.net/s35_erp?retryWrites=true&w=majority';

// Conectar a MongoDB
async function connectToDatabase() {
    if (client && db) {
        return { client, db };
    }

    try {
        client = new MongoClient(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await client.connect();
        db = client.db('s35_erp');
        
        console.log('Conectado a MongoDB Atlas');
        return { client, db };
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        throw error;
    }
}

// Obtener colecciones
async function getCollections() {
    const { db } = await connectToDatabase();
    
    return {
        users: db.collection('users'),
        products: db.collection('products'),
        orders: db.collection('orders'),
        quotes: db.collection('quotes'),
        clients: db.collection('clients'),
        inventory: db.collection('inventory'),
        notifications: db.collection('notifications'),
        settings: db.collection('settings')
    };
}

// Cerrar conexión
async function closeConnection() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('Conexión a MongoDB cerrada');
    }
}

// Inicializar base de datos con datos de ejemplo
async function initializeDatabase() {
    try {
        const collections = await getCollections();
        
        // Verificar si ya hay datos
        const productCount = await collections.products.countDocuments();
        if (productCount > 0) {
            console.log('Base de datos ya inicializada');
            return;
        }

        // Insertar productos de ejemplo
        const sampleProducts = [
            {
                name: 'Basecoat Blanco',
                category: 'Base',
                price: 450,
                stock: 150,
                minStock: 20,
                description: 'Base para estuco de alta calidad',
                image: 'basecoat-blanco.png',
                status: 'active',
                sku: 'BC-BLANCO-001',
                barcode: '1234567890123',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Estuco Premium',
                category: 'Acabado',
                price: 380,
                stock: 89,
                minStock: 15,
                description: 'Estuco de acabado premium',
                image: 'estuco-premium.png',
                status: 'active',
                sku: 'EST-PREM-001',
                barcode: '1234567890124',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ultraforce',
                category: 'Adhesivo',
                price: 520,
                stock: 12,
                minStock: 10,
                description: 'Adhesivo de ultra fuerza',
                image: 'ultraforce.png',
                status: 'low_stock',
                sku: 'ULT-FORCE-001',
                barcode: '1234567890125',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Cellbond',
                category: 'Adhesivo',
                price: 680,
                stock: 45,
                minStock: 15,
                description: 'Adhesivo celular de alta resistencia',
                image: 'cellbond.png',
                status: 'active',
                sku: 'CEL-BOND-001',
                barcode: '1234567890126',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await collections.products.insertMany(sampleProducts);

        // Insertar clientes de ejemplo
        const sampleClients = [
            {
                name: 'Constructora ABC',
                contact: 'Juan Pérez',
                email: 'contacto@constructora.com',
                phone: '+52 667 123 4567',
                address: 'Av. Principal 123, Culiacán',
                notes: 'Cliente preferencial',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Ingeniería XYZ',
                contact: 'María García',
                email: 'ventas@ingenieria.com',
                phone: '+52 667 987 6543',
                address: 'Blvd. Emiliano Zapata 456, Culiacán',
                notes: 'Especialista en proyectos grandes',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        await collections.clients.insertMany(sampleClients);

        // Insertar configuración del sistema
        const systemSettings = {
            companyName: 'Productos S-35 SA de CV',
            companyAddress: 'Blvd. Emiliano Zapata 2650 Colonia Industrial El Palmito Culiacan Sinaloa Mexico CP 80160',
            companyPhone: '+52 6671681535',
            companyEmail: 'contacto@s35.com.mx',
            taxRate: 0.16,
            currency: 'MXN',
            lowStockThreshold: 10,
            autoBackup: true,
            notifications: {
                email: true,
                sms: false,
                push: true
            },
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collections.settings.insertOne(systemSettings);

        console.log('Base de datos inicializada con datos de ejemplo');
    } catch (error) {
        console.error('Error inicializando base de datos:', error);
        throw error;
    }
}

module.exports = {
    connectToDatabase,
    getCollections,
    closeConnection,
    initializeDatabase
};
