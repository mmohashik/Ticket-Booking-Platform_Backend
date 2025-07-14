const EcomCategory = require('../../models/ecom/Category');
const mongoose = require('mongoose');

/**
 * Add a new category
 */
const addCategory = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return res.status(400).json({ status: "FAILED", message: "Name and description are required" });
    }

    try {
        const existingCategory = await EcomCategory.findOne({ name, deletedAt: 0 });
        if (existingCategory) {
            return res.status(400).json({ status: "FAILED", message: "Category with this name already exists" });
        }

        const newCategory = new EcomCategory({
            name,
            description,
            deletedAt: 0
        });

        await newCategory.save();
        return res.status(201).json({ status: "SUCCESS", message: "Category added successfully", data: newCategory });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get all non-deleted categories
 */
const getAllCategories = async (req, res) => {
    try {
        const categories = await EcomCategory.find({ deletedAt: 0 }).sort({ createdAt: -1 });
        return res.json({ status: "SUCCESS", data: categories });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Update a category
 */
const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid category ID" });
    }

    try {
        const category = await EcomCategory.findOne({ _id: id, deletedAt: 0 });
        if (!category) {
            return res.status(404).json({ status: "FAILED", message: "Category not found" });
        }

        if (name) category.name = name;
        if (description) category.description = description;

        await category.save();
        return res.json({ status: "SUCCESS", message: "Category updated successfully", data: category });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Soft delete a category
 */
const deleteCategory = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid category ID" });
    }

    try {
        const category = await EcomCategory.findOne({ _id: id, deletedAt: 0 });
        if (!category) {
            return res.status(404).json({ status: "FAILED", message: "Category not found" });
        }

        category.deletedAt = Date.now();
        await category.save();

        return res.json({ status: "SUCCESS", message: "Category deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
