const EcomProduct = require('../../models/ecom/Product');
const EcomCategory = require('../../models/ecom/Category');
const mongoose = require('mongoose');
const path = require('path');

/**
 * Helper function to parse JSON strings safely
 */
const parseJSONField = (field) => {
    if (typeof field === 'string') {
        try {
            return JSON.parse(field);
        } catch (e) {
            return [];
        }
    }
    return Array.isArray(field) ? field : [];
};

/**
 * Add a new e-commerce product
 */
const addProduct = async (req, res) => {
    const { 
        name, 
        description, 
        category,
        price = 0,
        quantity = 0,
        sku,
        material,
        careInstructions,
        sizes,
        colors,
        isActive = true
    } = req.body;

    if (!name || !description || !category) {
        return res.status(400).json({ status: "FAILED", message: "Name, description, and category are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid category ID" });
    }

    try {
        // Get category name
        const categoryData = await EcomCategory.findOne({ _id: category, deletedAt: 0 });
        if (!categoryData) {
            return res.status(400).json({ status: "FAILED", message: "Category not found" });
        }

        // Generate product code
        const rawPrefix = categoryData.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
        const regex = new RegExp(`^${rawPrefix}\\d{3}$`);

        // Find all products with the same prefix, including soft-deleted ones
        const productsWithPrefix = await EcomProduct.find({ productCode: { $regex: regex } });

        const maxNumber = productsWithPrefix.reduce((max, product) => {
            const match = product.productCode.match(/\d{3}$/);
            const num = match ? parseInt(match[0], 10) : 0;
            return Math.max(max, num);
        }, 0);

        const newCode = `${rawPrefix}${(maxNumber + 1).toString().padStart(3, '0')}`;

        // Image handling
        const imageUrls = req.files ? req.files.map(file => `http://${req.headers.host}/uploads/ecom/${file.filename}`) : [];

        // Parse arrays
        const parsedSizes = parseJSONField(sizes);
        const parsedColors = parseJSONField(colors);

        // Validate price and quantity
        const priceValue = Number(price) || 0;
        const quantityValue = Number(quantity) || 0;
        
        if (priceValue < 0) {
            return res.status(400).json({ status: "FAILED", message: "Price cannot be negative" });
        }
        if (quantityValue < 0) {
            return res.status(400).json({ status: "FAILED", message: "Quantity cannot be negative" });
        }

        const newProduct = new EcomProduct({
            name,
            productCode: newCode,
            description,
            category,
            price: priceValue,
            quantity: quantityValue,
            sku,
            material,
            careInstructions,
            sizes: parsedSizes,
            colors: parsedColors,
            images: imageUrls,
            isActive: Boolean(isActive),
            isDeleted: false,
            deletedAt: 0
        });

        await newProduct.save();

        const populatedProduct = await EcomProduct.findById(newProduct._id).populate('category');

        return res.status(201).json({ 
            status: "SUCCESS", 
            message: "Product added successfully", 
            data: populatedProduct 
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get all non-deleted products
 */
const getAllProducts = async (req, res) => {
    try {
        const products = await EcomProduct.find({ deletedAt: 0, isDeleted: false })
            .populate('category')
            .sort({ createdAt: -1 });
        return res.json({ status: "SUCCESS", data: products });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get all deleted/recycled products
 */
const getRecycledProducts = async (req, res) => {
    try {
        const products = await EcomProduct.find({ isDeleted: true })
            .populate('category')
            .populate('deletedBy', 'username email')
            .sort({ deletedAt: -1 });
        return res.json({ status: "SUCCESS", products: products });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get a single product by ID
 */
const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid product ID" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, deletedAt: 0, isDeleted: false }).populate('category');
        if (!product) {
            return res.status(404).json({ status: "FAILED", message: "Product not found" });
        }

        return res.json({ status: "SUCCESS", data: product });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Update a product
 */
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { 
        name, 
        description, 
        category,
        price,
        quantity,
        sku,
        material,
        careInstructions,
        sizes,
        colors,
        isActive
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid product ID" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, deletedAt: 0, isDeleted: false });
        if (!product) {
            return res.status(404).json({ status: "FAILED", message: "Product not found" });
        }

        // Validate category if provided
        if (category && !mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ status: "FAILED", message: "Invalid category ID" });
        }

        if (category) {
            const categoryData = await EcomCategory.findOne({ _id: category, deletedAt: 0 });
            if (!categoryData) {
                return res.status(400).json({ status: "FAILED", message: "Category not found" });
            }
        }

        // Update fields with validation
        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (price !== undefined) {
            const priceValue = Number(price);
            if (priceValue < 0) {
                return res.status(400).json({ status: "FAILED", message: "Price cannot be negative" });
            }
            product.price = priceValue;
        }
        if (quantity !== undefined) {
            const quantityValue = Number(quantity);
            if (quantityValue < 0) {
                return res.status(400).json({ status: "FAILED", message: "Quantity cannot be negative" });
            }
            product.quantity = quantityValue;
        }
        if (sku !== undefined) product.sku = sku;
        if (material !== undefined) product.material = material;
        if (careInstructions !== undefined) product.careInstructions = careInstructions;
        if (isActive !== undefined) product.isActive = Boolean(isActive);

        // Handle arrays
        if (sizes !== undefined) {
            product.sizes = parseJSONField(sizes);
        }
        if (colors !== undefined) {
            product.colors = parseJSONField(colors);
        }

        // Handle new images if uploaded
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map(file => `http://${req.headers.host}/uploads/ecom/${file.filename}`);
            product.images = imageUrls;
        }

        product.updatedAt = new Date();
        await product.save();

        const updatedProduct = await EcomProduct.findById(id).populate('category');

        return res.json({ 
            status: "SUCCESS", 
            message: "Product updated successfully", 
            product: updatedProduct 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Soft delete a product (Move to recycle bin)
 */
const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid product ID" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, deletedAt: 0, isDeleted: false });
        if (!product) {
            return res.status(404).json({ status: "FAILED", message: "Product not found" });
        }

        product.isDeleted = true;
        product.deletedAt = Date.now();
        
        // If you have user authentication, add the user who deleted it
        // product.deletedBy = req.user?.id;

        await product.save();

        return res.json({ status: "SUCCESS", message: "Product moved to recycle bin successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Restore a product from recycle bin
 */
const restoreProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid product ID" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, isDeleted: true });
        if (!product) {
            return res.status(404).json({ status: "FAILED", message: "Product not found in recycle bin" });
        }

        product.isDeleted = false;
        product.deletedAt = 0;
        product.deletedBy = undefined;
        product.updatedAt = new Date();

        await product.save();

        const restoredProduct = await EcomProduct.findById(id).populate('category');

        return res.json({ 
            status: "SUCCESS", 
            message: "Product restored successfully", 
            product: restoredProduct 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Permanently delete a product
 */
const permanentDeleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid product ID" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, isDeleted: true });
        if (!product) {
            return res.status(404).json({ status: "FAILED", message: "Product not found in recycle bin" });
        }

        await EcomProduct.findByIdAndDelete(id);

        return res.json({ status: "SUCCESS", message: "Product permanently deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Check stock availability for a product
 */
const checkStock = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: "Valid quantity is required" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, deletedAt: 0, isDeleted: false });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const isAvailable = product.quantity >= quantity;
        
        return res.json({ 
            success: true, 
            data: {
                available: isAvailable,
                stock: product.quantity
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

/**
 * Reduce stock quantity (for order processing)
 */
const reduceStock = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ status: "FAILED", message: "Invalid product ID" });
    }

    if (!quantity || quantity <= 0) {
        return res.status(400).json({ status: "FAILED", message: "Valid quantity is required" });
    }

    try {
        const product = await EcomProduct.findOne({ _id: id, deletedAt: 0, isDeleted: false });
        if (!product) {
            return res.status(404).json({ status: "FAILED", message: "Product not found" });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ 
                status: "FAILED", 
                message: `Insufficient stock. Only ${product.quantity} items available` 
            });
        }

        product.quantity -= quantity;
        product.updatedAt = new Date();
        await product.save();

        const updatedProduct = await EcomProduct.findById(id).populate('category');

        return res.json({ 
            status: "SUCCESS", 
            message: `Stock reduced by ${quantity}`, 
            data: updatedProduct 
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    addProduct,
    getAllProducts,
    getRecycledProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    restoreProduct,
    permanentDeleteProduct,
    checkStock,
    reduceStock
};
