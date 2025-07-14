const EcomCustomer = require('../../models/ecom/Customer');
const mongoose = require('mongoose');

/**
 * Add a new customer
 */
const addCustomer = async (req, res) => {
    const { firstName, lastName, email, phone, address, city, state } = req.body;

    if (!firstName || !lastName || !email || !phone || !address || !city || !state) {
        return res.status(400).json({ status: "FAILED", message: "All fields are required" });
    }

    try {
        const newCustomer = new EcomCustomer({
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            deletedAt: 0
        });

        await newCustomer.save();
        return res.status(201).json({ status: "SUCCESS", message: "Customer added successfully", data: newCustomer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get all non-deleted customers
 */
const getAllCustomers = async (req, res) => {
    try {
        const customers = await EcomCustomer.find({ deletedAt: 0 }).sort({ createdAt: -1 });
        return res.json({ status: "SUCCESS", data: customers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Update a customer
 */
const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid customer ID" });
    }

    try {
        const customer = await EcomCustomer.findOneAndUpdate(
            { _id: id, deletedAt: 0 },
            updateData,
            { new: true }
        );

        if (!customer) {
            return res.status(404).json({ status: "FAILED", message: "Customer not found" });
        }

        return res.json({ status: "SUCCESS", message: "Customer updated successfully", data: customer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Soft delete a customer
 */
const deleteCustomer = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid customer ID" });
    }

    try {
        const customer = await EcomCustomer.findOne({ _id: id, deletedAt: 0 });
        if (!customer) {
            return res.status(404).json({ status: "FAILED", message: "Customer not found" });
        }

        customer.deletedAt = Date.now();
        await customer.save();

        return res.json({ status: "SUCCESS", message: "Customer deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    addCustomer,
    getAllCustomers,
    updateCustomer,
    deleteCustomer
};
