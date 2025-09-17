// Script para poblar la base de datos con productos S-35
const { getCollections, initializeDatabase } = require('./mongodb');

const s35Products = [
    // BASES
    {
        name: 'Basecoat Blanco Absoluto',
        category: 'Base',
        price: 450,
        stock: 150,
        minStock: 20,
        description: 'Base para estuco de alta calidad, color blanco absoluto',
        image: 'basecoat-blanco-absoluto.png',
        sku: 'BC-BLANCO-ABS-001',
        barcode: '7501234567890',
        weight: 25,
        dimensions: { length: 30, width: 20, height: 15 },
        supplier: 'S-35 Technology',
        cost: 320,
        margin: 40.6,
        tags: ['base', 'blanco', 'estuco', 'exterior'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Basecoat Gris',
        category: 'Base',
        price: 450,
        stock: 120,
        minStock: 20,
        description: 'Base para estuco de alta calidad, color gris',
        image: 'basecoat-gris.png',
        sku: 'BC-GRIS-001',
        barcode: '7501234567891',
        weight: 25,
        dimensions: { length: 30, width: 20, height: 15 },
        supplier: 'S-35 Technology',
        cost: 320,
        margin: 40.6,
        tags: ['base', 'gris', 'estuco', 'exterior'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },

    // ACABADOS
    {
        name: 'Estuco Base Pro+',
        category: 'Acabado',
        price: 380,
        stock: 89,
        minStock: 15,
        description: 'Estuco de acabado premium para interiores y exteriores',
        image: 'estuco-base-pro.png',
        sku: 'EST-BASE-PRO-001',
        barcode: '7501234567892',
        weight: 20,
        dimensions: { length: 25, width: 18, height: 12 },
        supplier: 'S-35 Technology',
        cost: 270,
        margin: 40.8,
        tags: ['acabado', 'premium', 'interior', 'exterior'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'La Fina',
        category: 'Acabado',
        price: 420,
        stock: 65,
        minStock: 15,
        description: 'Acabado fino de alta calidad para superficies delicadas',
        image: 'la-fina.png',
        sku: 'FIN-LA-FINA-001',
        barcode: '7501234567893',
        weight: 18,
        dimensions: { length: 22, width: 16, height: 10 },
        supplier: 'S-35 Technology',
        cost: 300,
        margin: 40.0,
        tags: ['acabado', 'fino', 'delicado', 'interior'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },

    // ADHESIVOS
    {
        name: 'Ultraforce',
        category: 'Adhesivo',
        price: 520,
        stock: 12,
        minStock: 10,
        description: 'Adhesivo de ultra fuerza para materiales pesados',
        image: 'ultraforce.png',
        sku: 'ADH-ULTRA-001',
        barcode: '7501234567894',
        weight: 30,
        dimensions: { length: 35, width: 25, height: 18 },
        supplier: 'S-35 Technology',
        cost: 380,
        margin: 36.9,
        tags: ['adhesivo', 'ultra', 'fuerza', 'pesado'],
        status: 'low_stock',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cellbond',
        category: 'Adhesivo',
        price: 680,
        stock: 45,
        minStock: 15,
        description: 'Adhesivo celular de alta resistencia para construcción',
        image: 'cellbond.png',
        sku: 'ADH-CELL-001',
        barcode: '7501234567895',
        weight: 35,
        dimensions: { length: 40, width: 30, height: 20 },
        supplier: 'S-35 Technology',
        cost: 480,
        margin: 41.7,
        tags: ['adhesivo', 'celular', 'resistencia', 'construccion'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Styrobond',
        category: 'Adhesivo',
        price: 420,
        stock: 78,
        minStock: 15,
        description: 'Adhesivo especializado para poliestireno',
        image: 'styrobond.png',
        sku: 'ADH-STYRO-001',
        barcode: '7501234567896',
        weight: 28,
        dimensions: { length: 32, width: 22, height: 16 },
        supplier: 'S-35 Technology',
        cost: 300,
        margin: 40.0,
        tags: ['adhesivo', 'poliestireno', 'especializado'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },

    // PISOS
    {
        name: 'Piso Sobre Piso',
        category: 'Piso',
        price: 350,
        stock: 95,
        minStock: 20,
        description: 'Sistema de piso sobre piso para renovaciones',
        image: 'piso-sobre-piso.png',
        sku: 'PIS-SOBRE-001',
        barcode: '7501234567897',
        weight: 22,
        dimensions: { length: 28, width: 20, height: 14 },
        supplier: 'S-35 Technology',
        cost: 250,
        margin: 40.0,
        tags: ['piso', 'renovacion', 'sistema'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Porcelánico Universal',
        category: 'Piso',
        price: 480,
        stock: 60,
        minStock: 15,
        description: 'Adhesivo universal para porcelánicos',
        image: 'porcelanico-universal.png',
        sku: 'PIS-PORC-UNI-001',
        barcode: '7501234567898',
        weight: 26,
        dimensions: { length: 30, width: 22, height: 16 },
        supplier: 'S-35 Technology',
        cost: 340,
        margin: 41.2,
        tags: ['piso', 'porcelanico', 'universal', 'adhesivo'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cerámico',
        category: 'Piso',
        price: 320,
        stock: 110,
        minStock: 20,
        description: 'Adhesivo especializado para cerámicos',
        image: 'ceramico.png',
        sku: 'PIS-CERAM-001',
        barcode: '7501234567899',
        weight: 24,
        dimensions: { length: 26, width: 18, height: 12 },
        supplier: 'S-35 Technology',
        cost: 230,
        margin: 39.1,
        tags: ['piso', 'ceramico', 'adhesivo'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },

    // ESPECIALIZADOS
    {
        name: 'Mixandready',
        category: 'Especializado',
        price: 350,
        stock: 85,
        minStock: 15,
        description: 'Producto listo para usar, mezclado y preparado',
        image: 'mixandready.png',
        sku: 'ESP-MIX-001',
        barcode: '7501234567900',
        weight: 20,
        dimensions: { length: 25, width: 18, height: 12 },
        supplier: 'S-35 Technology',
        cost: 250,
        margin: 40.0,
        tags: ['especializado', 'listo', 'mezclado'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Pastablock',
        category: 'Especializado',
        price: 280,
        stock: 70,
        minStock: 15,
        description: 'Pasta especial para bloques de construcción',
        image: 'pastablock.png',
        sku: 'ESP-PASTA-001',
        barcode: '7501234567901',
        weight: 18,
        dimensions: { length: 24, width: 16, height: 10 },
        supplier: 'S-35 Technology',
        cost: 200,
        margin: 40.0,
        tags: ['especializado', 'pasta', 'bloques', 'construccion'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'Cemento Plástico',
        category: 'Especializado',
        price: 380,
        stock: 55,
        minStock: 15,
        description: 'Cemento con propiedades plásticas mejoradas',
        image: 'cemento-plastico.png',
        sku: 'ESP-CEM-PLAS-001',
        barcode: '7501234567902',
        weight: 26,
        dimensions: { length: 30, width: 22, height: 16 },
        supplier: 'S-35 Technology',
        cost: 270,
        margin: 40.5,
        tags: ['especializado', 'cemento', 'plastico', 'mejorado'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },

    // WAXTARD (Línea Premium)
    {
        name: 'WAXTARD Blanco Absoluto',
        category: 'Premium',
        price: 650,
        stock: 40,
        minStock: 10,
        description: 'Línea premium WAXTARD en blanco absoluto',
        image: 'WAXTARD-BLANCO-ABSOLUTO.png',
        sku: 'WAX-BLANCO-ABS-001',
        barcode: '7501234567903',
        weight: 32,
        dimensions: { length: 35, width: 25, height: 18 },
        supplier: 'S-35 Technology',
        cost: 450,
        margin: 44.4,
        tags: ['premium', 'waxtard', 'blanco', 'absoluto'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'WAXTARD Blanco Perla',
        category: 'Premium',
        price: 680,
        stock: 35,
        minStock: 10,
        description: 'Línea premium WAXTARD en blanco perla',
        image: 'WAXTARD-blanco-perla.png',
        sku: 'WAX-BLANCO-PERL-001',
        barcode: '7501234567904',
        weight: 32,
        dimensions: { length: 35, width: 25, height: 18 },
        supplier: 'S-35 Technology',
        cost: 470,
        margin: 44.1,
        tags: ['premium', 'waxtard', 'blanco', 'perla'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        name: 'WAXTARD Gris',
        category: 'Premium',
        price: 650,
        stock: 38,
        minStock: 10,
        description: 'Línea premium WAXTARD en gris',
        image: 'WAXTARD-gris.png',
        sku: 'WAX-GRIS-001',
        barcode: '7501234567905',
        weight: 32,
        dimensions: { length: 35, width: 25, height: 18 },
        supplier: 'S-35 Technology',
        cost: 450,
        margin: 44.4,
        tags: ['premium', 'waxtard', 'gris'],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

async function seedProducts() {
    try {
        console.log('🌱 Iniciando población de productos S-35...');
        
        await initializeDatabase();
        const collections = await getCollections();
        
        // Limpiar productos existentes
        await collections.products.deleteMany({});
        console.log('🗑️ Productos existentes eliminados');
        
        // Insertar nuevos productos
        const result = await collections.products.insertMany(s35Products);
        console.log(`✅ ${result.insertedCount} productos insertados exitosamente`);
        
        // Mostrar estadísticas por categoría
        const stats = await collections.products.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
                    avgPrice: { $avg: '$price' }
                }
            },
            { $sort: { count: -1 } }
        ]).toArray();
        
        console.log('\n📊 Estadísticas por categoría:');
        stats.forEach(stat => {
            console.log(`  ${stat._id}: ${stat.count} productos, Valor total: $${stat.totalValue.toLocaleString()}, Precio promedio: $${stat.avgPrice.toFixed(0)}`);
        });
        
        console.log('\n🎉 Población de productos completada!');
        
    } catch (error) {
        console.error('❌ Error poblando productos:', error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    seedProducts();
}

module.exports = { seedProducts, s35Products };
