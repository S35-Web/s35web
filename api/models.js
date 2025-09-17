const { ObjectId } = require('mongodb');

// Schemas de validación
const schemas = {
    product: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 3 },
            description: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            cost: { type: 'number', minimum: 0 },
            category: { type: 'string' },
            sku: { type: 'string', pattern: '^[A-Z0-9-]+$' },
            barcode: { type: 'string', pattern: '^[0-9]+$' },
            stock: { type: 'integer', minimum: 0 },
            minStock: { type: 'integer', minimum: 0 },
            status: { type: 'string', enum: ['active', 'low_stock', 'out_of_stock'] },
            image: { type: 'string' },
            supplier: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['name', 'price', 'cost', 'category', 'stock', 'minStock'],
        additionalProperties: false
    },
    order: {
        type: 'object',
        properties: {
            clientId: { type: 'string' }, // ObjectId
            items: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        productId: { type: 'string' }, // ObjectId
                        productName: { type: 'string' },
                        quantity: { type: 'integer', minimum: 1 },
                        price: { type: 'number', minimum: 0 }
                    },
                    required: ['productId', 'productName', 'quantity', 'price']
                }
            },
            totalAmount: { type: 'number', minimum: 0 },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] },
            orderType: { type: 'string', enum: ['order', 'quote'] },
            paymentProof: { type: 'string' }, // URL del comprobante
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['clientId', 'items', 'totalAmount', 'status', 'orderType'],
        additionalProperties: false
    },
    client: {
        type: 'object',
        properties: {
            name: { type: 'string', minLength: 3 },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            address: { type: 'string' },
            rfc: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['name', 'email', 'phone'],
        additionalProperties: false
    },
    user: {
        type: 'object',
        properties: {
            username: { type: 'string', minLength: 3 },
            password: { type: 'string', minLength: 6 },
            userType: { type: 'string', enum: ['pdc', 'pos', 'client', 'colaborador'] },
            email: { type: 'string', format: 'email' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['username', 'password', 'userType'],
        additionalProperties: false
    }
};

function validateDocument(schema, data) {
    // Simple validation for now, can integrate a full JSON schema validator like 'ajv'
    const errors = [];
    const schemaProps = schemas[schema].properties;
    const requiredProps = schemas[schema].required || [];

    for (const prop of requiredProps) {
        if (data[prop] === undefined || data[prop] === null || data[prop] === '') {
            errors.push(`El campo '${prop}' es requerido.`);
        }
    }

    for (const key in data) {
        if (schemaProps[key]) {
            const propSchema = schemaProps[key];
            if (propSchema.type && typeof data[key] !== propSchema.type) {
                // Basic type checking
                if (propSchema.type === 'string' && typeof data[key] !== 'string') {
                     errors.push(`El campo '${key}' debe ser de tipo ${propSchema.type}.`);
                }
                if (propSchema.type === 'number' && typeof data[key] !== 'number') {
                    errors.push(`El campo '${key}' debe ser de tipo ${propSchema.type}.`);
                }
                if (propSchema.type === 'integer' && (!Number.isInteger(data[key]))) {
                    errors.push(`El campo '${key}' debe ser un número entero.`);
                }
            }
            if (propSchema.minLength && data[key].length < propSchema.minLength) {
                errors.push(`El campo '${key}' debe tener al menos ${propSchema.minLength} caracteres.`);
            }
            if (propSchema.minimum && data[key] < propSchema.minimum) {
                errors.push(`El campo '${key}' debe ser al menos ${propSchema.minimum}.`);
            }
            if (propSchema.enum && !propSchema.enum.includes(data[key])) {
                errors.push(`El campo '${key}' debe ser uno de: ${propSchema.enum.join(', ')}.`);
            }
            if (propSchema.pattern && !new RegExp(propSchema.pattern).test(data[key])) {
                errors.push(`El campo '${key}' no cumple con el formato requerido.`);
            }
        } else if (schemas[schema].additionalProperties === false) {
            errors.push(`El campo '${key}' no es una propiedad permitida.`);
        }
    }

    return errors;
}

function buildSearchQuery(filters) {
    const query = {};
    if (filters.search) {
        const searchRegex = { $regex: filters.search, $options: 'i' };
        query.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { sku: searchRegex },
            { category: searchRegex }
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

function buildSortOptions(sortBy, sortOrder) {
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    return sortOptions;
}

module.exports = {
    validateDocument,
    schemas,
    buildSearchQuery,
    buildSortOptions
};
