/**
 * E-commerce 404 Not Found handler
 */
exports.ecomNotFound = (req, res) => {
    res.status(404).json({ status: "FAILED", message: "E-commerce route not found" });
};

/**
 * E-commerce Error handler
 */
exports.ecomErrorHandler = (err, req, res, next) => {
    console.error('E-commerce Error:', err.stack);
    res.status(500).json({ 
        status: "FAILED", 
        message: "Internal server error in e-commerce module",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};
