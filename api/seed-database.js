// api/seed-database.js - Poblar base de datos con datos iniciales
// const { getCollections } = require('./mongodb');

// Datos iniciales de productos S-35
const initialProducts = [
    {
        name: 'Basecoat Blanco Absoluto',
        description: 'Base para estuco de alta calidad, color blanco absoluto',
        price: 450,
        cost: 200,
        category: 'Base',
        sku: 'BC-BLANCO-ABS-001',
        barcode: '100000000001',
        stock: 150,
        minStock: 20,
        status: 'active',
        image: 'basecoat-blanco-absoluto.png',
        supplier: 'Proveedor A',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Estuco Base Pro+',
        description: 'Estuco de acabado premium para interiores y exteriores',
        price: 380,
        cost: 180,
        category: 'Acabado',
        sku: 'EST-BASE-PRO-001',
        barcode: '100000000002',
        stock: 89,
        minStock: 15,
        status: 'active',
        image: 'estuco-base-pro.png',
        supplier: 'Proveedor B',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Ultraforce',
        description: 'Adhesivo de ultra fuerza para materiales pesados',
        price: 520,
        cost: 250,
        category: 'Adhesivo',
        sku: 'ADH-ULTRA-001',
        barcode: '100000000003',
        stock: 12,
        minStock: 10,
        status: 'low_stock',
        image: 'ultraforce.png',
        supplier: 'Proveedor C',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cellbond',
        description: 'Adhesivo celular de alta resistencia para construcción',
        price: 680,
        cost: 320,
        category: 'Adhesivo',
        sku: 'ADH-CELL-001',
        barcode: '100000000004',
        stock: 45,
        minStock: 15,
        status: 'active',
        image: 'cellbond.png',
        supplier: 'Proveedor A',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'WAXTARD Blanco Absoluto',
        description: 'Línea premium WAXTARD en blanco absoluto',
        price: 650,
        cost: 300,
        category: 'Premium',
        sku: 'WAX-BLANCO-ABS-001',
        barcode: '100000000005',
        stock: 40,
        minStock: 10,
        status: 'active',
        image: 'WAXTARD-BLANCO-ABSOLUTO.png',
        supplier: 'Proveedor B',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cemento Plástico',
        description: 'Cemento plástico de alta calidad para construcción',
        price: 320,
        cost: 150,
        category: 'Base',
        sku: 'CEM-PLAST-001',
        barcode: '100000000006',
        stock: 75,
        minStock: 20,
        status: 'active',
        image: 'cemento-plastico.png',
        supplier: 'Proveedor C',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cerámico Universal',
        description: 'Adhesivo para cerámico de uso universal',
        price: 420,
        cost: 200,
        category: 'Adhesivo',
        sku: 'CER-UNIV-001',
        barcode: '100000000007',
        stock: 30,
        minStock: 10,
        status: 'active',
        image: 'ceramico.png',
        supplier: 'Proveedor A',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Piso Sobre Piso',
        description: 'Adhesivo especializado para instalar piso sobre piso existente',
        price: 350,
        cost: 170,
        category: 'Piso',
        sku: 'PIS-SOBRE-001',
        barcode: '100000000008',
        stock: 25,
        minStock: 8,
        status: 'active',
        image: 'piso-sobre-piso.png',
        supplier: 'Proveedor B',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Porcelánico Universal',
        description: 'Adhesivo especializado para porcelánico',
        price: 480,
        cost: 230,
        category: 'Adhesivo',
        sku: 'POR-UNIV-001',
        barcode: '100000000009',
        stock: 18,
        minStock: 5,
        status: 'active',
        image: 'porcelanico.png',
        supplier: 'Proveedor C',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Styrobond',
        description: 'Adhesivo especializado para poliestireno',
        price: 380,
        cost: 180,
        category: 'Adhesivo',
        sku: 'STY-BOND-001',
        barcode: '100000000010',
        stock: 35,
        minStock: 10,
        status: 'active',
        image: 'styrobond.png',
        supplier: 'Proveedor A',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Datos iniciales de clientes
const initialClients = [
    {
        name: 'Constructora del Norte S.A. de C.V.',
        email: 'compras@constructoranorte.com.mx',
        phone: '6671234567',
        address: 'Av. Insurgentes 123, Culiacán, Sinaloa',
        rfc: 'CON123456789',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Inmobiliaria del Pacífico',
        email: 'ventas@inmopacifico.com',
        phone: '6679876543',
        address: 'Blvd. Emiliano Zapata 456, Culiacán, Sinaloa',
        rfc: 'INM987654321',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Arquitectura Moderna',
        email: 'contacto@arquimoderna.com',
        phone: '6675551234',
        address: 'Calle Morelos 789, Culiacán, Sinaloa',
        rfc: 'ARM555123456',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

// Datos iniciales de usuarios
const initialUsers = [
    {
        username: 'admin',
        password: 'admin123', // En producción, esto debería estar hasheado
        userType: 'pdc',
        email: 'admin@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: 'ventas1',
        password: 'ventas123',
        userType: 'pos',
        email: 'ventas1@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        username: 'cliente1',
        password: 'cliente123',
        userType: 'client',
        email: 'cliente1@s35.com.mx',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Por ahora, solo devolver los datos sin conectar a MongoDB
        return res.status(200).json({
            success: true,
            message: 'API de seed funcionando - MongoDB pendiente de configuración',
            data: {
                products: initialProducts.length,
                clients: initialClients.length,
                users: initialUsers.length,
                mongodb_configured: !!process.env.MONGODB_URI
            },
            note: 'Para habilitar MongoDB, asegúrate de que MONGODB_URI esté configurada en Vercel'
        });

    } catch (error) {
        console.error('Error seeding database:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al poblar la base de datos',
            error: error.message
        });
    }
};
