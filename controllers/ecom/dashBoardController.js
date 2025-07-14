const EcomProduct = require('../../models/ecom/Product');
const EcomCategory = require('../../models/ecom/Category');
const EcomCustomer = require('../../models/ecom/Customer');
const EcomOrder = require('../../models/ecom/Order');
const EcomStock = require('../../models/ecom/Stock');

/**
 * Get dashboard statistics
 */
const getDashboardStats = async (req, res) => {
    try {
        // Get counts for dashboard cards
        const totalProducts = await EcomProduct.countDocuments({ deletedAt: 0 });
        const totalCategories = await EcomCategory.countDocuments({ deletedAt: 0 });
        const totalCustomers = await EcomCustomer.countDocuments({ deletedAt: 0 });
        const totalOrders = await EcomOrder.countDocuments({ deletedAt: 0 });
        
        // Get revenue (sum of all completed orders)
        const revenueResult = await EcomOrder.aggregate([
            { $match: { deletedAt: 0, status: { $in: ['Delivered', 'Shipped'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Get low stock count
        const lowStockCount = await EcomStock.countDocuments({
            deletedAt: 0,
            $expr: { $lt: ["$quantity", "$lowStockAlert"] }
        });

        // Get recent orders
        const recentOrders = await EcomOrder.find({ deletedAt: 0 })
            .populate('customer')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get order status distribution
        const orderStatusStats = await EcomOrder.aggregate([
            { $match: { deletedAt: 0 } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get monthly sales data (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await EcomOrder.aggregate([
            { 
                $match: { 
                    deletedAt: 0, 
                    createdAt: { $gte: sixMonthsAgo },
                    status: { $in: ['Delivered', 'Shipped'] }
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const dashboardData = {
            overview: {
                totalProducts,
                totalCategories,
                totalCustomers,
                totalOrders,
                totalRevenue,
                lowStockCount
            },
            recentOrders,
            orderStatusStats,
            monthlySales
        };

        return res.json({ status: "SUCCESS", data: dashboardData });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

/**
 * Get sales analytics
 */
const getSalesAnalytics = async (req, res) => {
    try {
        // Top selling products
        const topProducts = await EcomOrder.aggregate([
            { $match: { deletedAt: 0 } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.stock',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$totalAmount'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'ecomstocks',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'stock'
                }
            },
            {
                $lookup: {
                    from: 'ecomproducts',
                    localField: 'stock.product',
                    foreignField: '_id',
                    as: 'product'
                }
            }
        ]);

        return res.json({ status: "SUCCESS", data: { topProducts } });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "FAILED", message: "Internal server error", error: err.message });
    }
};

module.exports = {
    getDashboardStats,
    getSalesAnalytics
};
