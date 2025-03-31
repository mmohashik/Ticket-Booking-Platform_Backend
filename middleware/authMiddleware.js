// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Authentication required' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.id;
    
    // Verify admin exists
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Admin not found' 
      });
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ 
      status: 'error',
      message: 'Please authenticate' 
    });
  }
};