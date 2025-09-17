// Modelos de datos para MongoDB
const { ObjectId } = require('mongodb');

// Esquemas de validación
const schemas = {
    user: {
        username: { type: 'string', required: true, unique: true },
        email: { type: 'string', required: true, unique: true },
        password: { type: 'string', required: true },
        userType: { type: 'string', required: true, enum: ['admin', 'pos', 'client', 'colaborador'] },
        role: { type: 'string', required: true },
        isActive: { type: 'boolean', default: true },
        lastLogin: { type: 'date' },
        createdAt: { type: 'date', default: Date.now },
        updatedAt: { type: 'date', default: Date.now }
    },

    product: {
        name: { type: 'string', required: true },
        category: { type: 'string', required: true },
        price: { type: 'number', required: true, min: 0 },
        stock: { type: 'number', required: true, min: 0 },
        minStock: { type: 'number', required: true, min: 0 },
        description: { type: 'string' },
        image: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive', 'low_stock', 'out_of_stock'], default: 'active' },
        sku: { type: 'string', unique: true },
        barcode: { type: 'string', unique: true },
        weight: { type: 'number' },
        dimensions: {
            length: { type: 'number' },
            width: { type: 'number' },
            height: { type: 'number' }
        },
        supplier: { type: 'string' },
        cost: { type: 'number' },
        margin: { type: 'number' },
        tags: [{ type: 'string' }],
        createdAt: { type: 'date', default: Date.now },
        updatedAt: { type: 'date', default: Date.now }
    },

    client: {
        name: { type: 'string', required: true },
        contact: { type: 'string', required: true },
        email: { type: 'string', required: true, unique: true },
        phone: { type: 'string', required: true },
        address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        zipCode: { type: 'string' },
        country: { type: 'string', default: 'México' },
        rfc: { type: 'string' },
        notes: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'], default: 'active' },
        creditLimit: { type: 'number', default: 0 },
        paymentTerms: { type: 'string', default: '30 días' },
        discount: { type: 'number', default: 0 },
        createdAt: { type: 'date', default: Date.now },
        updatedAt: { type: 'date', default: Date.now }
    },

    order: {
        folio: { type: 'string', required: true, unique: true },
        clientId: { type: 'ObjectId', required: true, ref: 'clients' },
        clientName: { type: 'string', required: true },
        clientEmail: { type: 'string' },
        clientPhone: { type: 'string' },
        items: [{
            productId: { type: 'ObjectId', required: true, ref: 'products' },
            productName: { type: 'string', required: true },
            quantity: { type: 'number', required: true, min: 1 },
            price: { type: 'number', required: true, min: 0 },
            total: { type: 'number', required: true, min: 0 }
        }],
        subtotal: { type: 'number', required: true, min: 0 },
        tax: { type: 'number', required: true, min: 0 },
        total: { type: 'number', required: true, min: 0 },
        status: { type: 'string', enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'], default: 'pending' },
        paymentStatus: { type: 'string', enum: ['pending', 'verified', 'paid', 'failed'], default: 'pending' },
        paymentMethod: { type: 'string' },
        paymentProof: { type: 'string' },
        deliveryDate: { type: 'date' },
        deliveryAddress: { type: 'string' },
        notes: { type: 'string' },
        createdBy: { type: 'string', required: true },
        createdAt: { type: 'date', default: Date.now },
        updatedAt: { type: 'date', default: Date.now }
    },

    quote: {
        folio: { type: 'string', required: true, unique: true },
        clientId: { type: 'ObjectId', required: true, ref: 'clients' },
        clientName: { type: 'string', required: true },
        clientEmail: { type: 'string' },
        clientPhone: { type: 'string' },
        items: [{
            productId: { type: 'ObjectId', required: true, ref: 'products' },
            productName: { type: 'string', required: true },
            quantity: { type: 'number', required: true, min: 1 },
            price: { type: 'number', required: true, min: 0 },
            total: { type: 'number', required: true, min: 0 }
        }],
        subtotal: { type: 'number', required: true, min: 0 },
        tax: { type: 'number', required: true, min: 0 },
        total: { type: 'number', required: true, min: 0 },
        status: { type: 'string', enum: ['pending', 'sent', 'viewed', 'paid', 'converted', 'expired'], default: 'pending' },
        validUntil: { type: 'date', required: true },
        paymentProof: { type: 'string' },
        notes: { type: 'string' },
        createdBy: { type: 'string', required: true },
        createdAt: { type: 'date', default: Date.now },
        updatedAt: { type: 'date', default: Date.now }
    },

    inventory: {
        productId: { type: 'ObjectId', required: true, ref: 'products' },
        productName: { type: 'string', required: true },
        operation: { type: 'string', enum: ['add', 'subtract', 'adjust'], required: true },
        quantity: { type: 'number', required: true },
        previousStock: { type: 'number', required: true },
        newStock: { type: 'number', required: true },
        reason: { type: 'string' },
        reference: { type: 'string' }, // orderId, quoteId, etc.
        performedBy: { type: 'string', required: true },
        createdAt: { type: 'date', default: Date.now }
    },

    notification: {
        userId: { type: 'ObjectId', ref: 'users' },
        userType: { type: 'string', enum: ['admin', 'pos', 'client', 'colaborador'] },
        type: { type: 'string', enum: ['info', 'warning', 'error', 'success'], required: true },
        title: { type: 'string', required: true },
        message: { type: 'string', required: true },
        data: { type: 'object' },
        isRead: { type: 'boolean', default: false },
        readAt: { type: 'date' },
        createdAt: { type: 'date', default: Date.now }
    }
};

// Funciones de validación
function validateDocument(schema, document) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
        const value = document[field];
        
        // Verificar campos requeridos
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} es requerido`);
            continue;
        }
        
        // Verificar tipo
        if (value !== undefined && rules.type) {
            const expectedType = rules.type;
            const actualType = typeof value;
            
            if (expectedType === 'number' && isNaN(value)) {
                errors.push(`${field} debe ser un número`);
            } else if (expectedType === 'date' && !(value instanceof Date)) {
                errors.push(`${field} debe ser una fecha`);
            } else if (expectedType === 'ObjectId' && !ObjectId.isValid(value)) {
                errors.push(`${field} debe ser un ObjectId válido`);
            }
        }
        
        // Verificar valores mínimos
        if (rules.min !== undefined && value < rules.min) {
            errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
        }
        
        // Verificar enum
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${field} debe ser uno de: ${rules.enum.join(', ')}`);
        }
    }
    
    return errors;
}

// Funciones de utilidad para generar folios
function generateOrderFolio() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `S35-${year}${month}${day}${random}`;
}

function generateQuoteFolio() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `COT-${year}${month}${day}${random}`;
}

// Funciones de búsqueda y filtrado
function buildSearchQuery(filters) {
    const query = {};
    
    if (filters.search) {
        query.$or = [
            { name: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
            { sku: { $regex: filters.search, $options: 'i' } }
        ];
    }
    
    if (filters.category) {
        query.category = filters.category;
    }
    
    if (filters.status) {
        query.status = filters.status;
    }
    
    if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
    }
    
    return query;
}

function buildSortOptions(sortBy, sortOrder = 'asc') {
    const order = sortOrder === 'desc' ? -1 : 1;
    
    switch (sortBy) {
        case 'name':
            return { name: order };
        case 'price':
            return { price: order };
        case 'stock':
            return { stock: order };
        case 'createdAt':
            return { createdAt: order };
        case 'updatedAt':
            return { updatedAt: order };
        default:
            return { createdAt: -1 };
    }
}

module.exports = {
    schemas,
    validateDocument,
    generateOrderFolio,
    generateQuoteFolio,
    buildSearchQuery,
    buildSortOptions
};
