const mongoose = require('mongoose');
const createEcomConnection = require('../../config/ecomDatabase');

const Schema = mongoose.Schema;

const EcomCategorySchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Number, default: 0 }
});

// Add index for faster queries based on deletedAt
EcomCategorySchema.index({ deletedAt: 1 });

// Use the separate e-commerce database connection
const ecomConnection = createEcomConnection();
const EcomCategory = ecomConnection.model('EcomCategory', EcomCategorySchema);

module.exports = EcomCategory;
