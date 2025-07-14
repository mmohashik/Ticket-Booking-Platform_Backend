const EcomStock = require('../../models/ecom/Stock');
const EcomProduct = require('../../models/ecom/Product');
const mongoose = require('mongoose');

/**
 * Add new stock
 */
const addStock = async (req, res) => {
    const { product, batchNumber, quantity, size, price, supplier } = req.body;

    if (!product || !batchNumber || !quantity || !size || !price || !supplier) {
        return res.status(400).json({ status: "FAILED", message: "All fields are required" });
    }

    try {
        const newStock = new EcomStock({
            product,
            batchNumber,
            quantity,
            size,
            price,
            supplier,
            deletedAt: 0
        });

        await newStock.save();
        const populatedStock = await EcomStock.findById(newStock._id).populate('product');

        return res.status(201).json({ status: "SUCCESS", message: "Stock added successfully", data: populatedStock });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get all non-deleted stock
 */
const getAllStock = async (req, res) => {
    try {
        const stock = await EcomStock.find({ deletedAt: 0 })
            .populate('product')
            .sort({ createdAt: -1 });

        return res.json({ status: "SUCCESS", data: stock });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Update stock quantity
 */
const updateStock = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid stock ID" });
    }

    try {
        const stock = await EcomStock.findOneAndUpdate(
            { _id: id, deletedAt: 0 },
            updateData,
            { new: true }
        ).populate('product');

        if (!stock) {
            return res.status(404).json({ status: "FAILED", message: "Stock not found" });
        }

        return res.json({ status: "SUCCESS", message: "Stock updated successfully", data: stock });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get low stock items
 */
const getLowStock = async (req, res) => {
    try {
        const lowStockItems = await EcomStock.find({
            deletedAt: 0,
            $expr: { $lt: ["$quantity", "$lowStockAlert"] }
        }).populate('product');

        return res.json({ status: "SUCCESS", data: lowStockItems });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    addStock,
    getAllStock,
    updateStock,
    getLowStock
};
