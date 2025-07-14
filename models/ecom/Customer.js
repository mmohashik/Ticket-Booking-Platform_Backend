const mongoose = require('mongoose');
const createEcomConnection = require('../../config/ecomDatabase');

const Schema = mongoose.Schema;

const EcomCustomerSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { 
        type: String, 
        required: true,
        enum: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania']
    },
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Number, default: 0 }
});

// Add index for faster queries based on deletedAt
EcomCustomerSchema.index({ deletedAt: 1 });

// Create a sparse index on email so null values don't cause conflicts
EcomCustomerSchema.index({ email: 1 }, { sparse: true });

// Use the separate e-commerce database connection
const ecomConnection = createEcomConnection();
const EcomCustomer = ecomConnection.model('EcomCustomer', EcomCustomerSchema);

module.exports = EcomCustomer;
