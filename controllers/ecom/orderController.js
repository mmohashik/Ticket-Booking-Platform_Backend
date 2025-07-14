const EcomOrder = require('../../models/ecom/Order');
const EcomCustomer = require('../../models/ecom/Customer');
const EcomStock = require('../../models/ecom/Stock');
const mongoose = require('mongoose');

/**
 * Create a new order
 */
const createOrder = async (req, res) => {
    const { customer, items, totalAmount } = req.body;

    if (!customer || !items || !totalAmount) {
        return res.status(400).json({ status: "FAILED", message: "Customer, items, and total amount are required" });
    }

    try {
        const newOrder = new EcomOrder({
            customer,
            items,
            totalAmount,
            status: 'Pending',
            deletedAt: 0
        });

        await newOrder.save();
        const populatedOrder = await EcomOrder.findById(newOrder._id)
            .populate('customer')
            .populate('items.stock');

        return res.status(201).json({ status: "SUCCESS", message: "Order created successfully", data: populatedOrder });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get all non-deleted orders
 */
const getAllOrders = async (req, res) => {
    try {
        const orders = await EcomOrder.find({ deletedAt: 0 })
            .populate('customer')
            .populate('items.stock')
            .sort({ createdAt: -1 });

        return res.json({ status: "SUCCESS", data: orders });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid order ID" });
    }

    if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid status" });
    }

    try {
        const order = await EcomOrder.findOneAndUpdate(
            { _id: id, deletedAt: 0 },
            { status },
            { new: true }
        ).populate('customer').populate('items.stock');

        if (!order) {
            return res.status(404).json({ status: "FAILED", message: "Order not found" });
        }

        return res.json({ status: "SUCCESS", message: "Order status updated successfully", data: order });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid order ID" });
    }

    try {
        const order = await EcomOrder.findOne({ _id: id, deletedAt: 0 })
            .populate('customer')
            .populate('items.stock');

        if (!order) {
            return res.status(404).json({ status: "FAILED", message: "Order not found" });
        }

        return res.json({ status: "SUCCESS", data: order });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderById
};
