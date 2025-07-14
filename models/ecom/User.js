const mongoose = require('mongoose');
const createEcomConnection = require('../../config/ecomDatabase');

const Schema = mongoose.Schema;

const EcomUserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

// Use the separate e-commerce database connection
const ecomConnection = createEcomConnection();
const EcomUser = ecomConnection.model('EcomUser', EcomUserSchema);

module.exports = EcomUser;
