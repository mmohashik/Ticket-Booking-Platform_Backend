const mongoose = require('mongoose');

let ecomConnection = null;

// Create a singleton connection for e-commerce database
const createEcomConnection = () => {
    if (ecomConnection) {
        return ecomConnection;
    }

    const ecomMongoUri = process.env.ECOM_MONGODB_URI || process.env.MONGODB_URI;
    
    console.log('🔗 Connecting to E-commerce Database...');
    
    ecomConnection = mongoose.createConnection(ecomMongoUri);

    ecomConnection.on('connected', () => {
        console.log('✅ Connected to E-commerce MongoDB (BigideaEcomDB)');
    });

    ecomConnection.on('error', (err) => {
        console.error('❌ E-commerce MongoDB connection error:', err);
    });

    ecomConnection.on('disconnected', () => {
        console.log('⚠️ E-commerce MongoDB disconnected');
    });

    return ecomConnection;
};

module.exports = createEcomConnection;
