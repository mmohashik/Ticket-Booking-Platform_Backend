const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");

const adminController = {
  // Create new admin
  createAdmin: async (req, res) => {
    try {
      const { name, email, password, mobile } = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = new Admin({
        name,
        email,
        password: hashedPassword,
        mobile
      });

      await admin.save();

      // Remove password from response
      const adminData = admin.toObject();
      delete adminData.password;

      res.status(201).json({
        status: 'success',
        data: { admin: adminData }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Admin login (session-based)
  loginAdmin: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find admin by email
      const admin = await Admin.findOne({ email }).select('+password');
      if (!admin) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Compare passwords
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      // Create session
      req.session.adminId = admin._id;
      req.session.save();

      // Return admin data without password
      const adminData = admin.toObject();
      delete adminData.password;

      res.json({
        status: 'success',
        data: { admin: adminData }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Get current admin (session-based)
  getCurrentAdmin: async (req, res) => {
    try {
      if (!req.session.adminId) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      const admin = await Admin.findById(req.session.adminId).select('-password');
      if (!admin) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin not found'
        });
      }

      res.json({
        status: 'success',
        data: { admin }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Admin logout (session-based)
  logoutAdmin: (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.status(500).json({
          status: 'error',
          message: 'Logout failed'
        });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({
        status: 'success',
        message: 'Logged out successfully'
      });
    });
  },

  // Get all admins
  getAllAdmins: async (req, res) => {
    try {
      const admins = await Admin.find({}).select('-password');
      res.json({
        status: 'success',
        data: { admins }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Get single admin
  getAdmin: async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id).select('-password');
      if (!admin) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin not found'
        });
      }
      res.json({
        status: 'success',
        data: { admin }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Update admin
  updateAdmin: async (req, res) => {
    try {
      const updates = req.body;
      const admin = await Admin.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, select: '-password' }
      );
      
      if (!admin) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin not found'
        });
      }
      
      res.json({
        status: 'success',
        data: { admin }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Delete admin
  deleteAdmin: async (req, res) => {
    try {
      const admin = await Admin.findByIdAndDelete(req.params.id);
      if (!admin) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin not found'
        });
      }
      res.json({
        status: 'success',
        message: 'Admin deleted'
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = req.params.id;

      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters'
        });
      }

      // Find admin with password
      const admin = await Admin.findById(adminId).select('+password');
      if (!admin) {
        return res.status(404).json({
          status: 'error',
          message: 'Admin not found'
        });
      }

      // Verify current password
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: 'Current password is incorrect'
        });
      }

      // Hash and save new password
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(newPassword, salt);
      await admin.save();

      // Return success without sensitive data
      const adminData = admin.toObject();
      delete adminData.password;

      res.json({
        status: 'success',
        message: 'Password updated successfully',
        data: { admin: adminData }
      });
    } catch (err) {
      console.error('Password change error:', err);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  }
};

module.exports = adminController;