const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db;
let collections = {};

async function initializeDatabase() {
    if (db) return; // Already connected

    try {
        await client.connect();
        db = client.db("s35_erp"); // Your database name
        
        // Initialize collections
        collections.products = db.collection('products');
        collections.orders = db.collection('orders');
        collections.quotes = db.collection('quotes');
        collections.clients = db.collection('clients');
        collections.users = db.collection('users');
        collections.inventory = db.collection('inventory');
        collections.notifications = db.collection('notifications');
        collections.settings = db.collection('settings');

        console.log("MongoDB connected and collections initialized!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to MongoDB");
    }
}

async function getCollections() {
    if (!db) {
        await initializeDatabase();
    }
    return collections;
}

module.exports = {
    initializeDatabase,
    getCollections,
    client // Export client for direct access if needed
};
