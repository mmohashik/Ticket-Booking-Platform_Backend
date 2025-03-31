const Admin = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminController = {
  // Create new admin
  createAdmin: async (req, res) => {
    try {
      const { name, email, password, mobile } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          status: "error",
          message: "Email already in use",
        });
      }

      // Create new admin instance
      const admin = new Admin({
        name,
        email,
        password, // Will be hashed by the pre-save hook
        mobile,
      });

      await admin.save();

      // Remove password from response
      const adminData = admin.toObject();
      delete adminData.password;

      res.status(201).json({
        status: "success",
        data: { admin: adminData },
      });
    } catch (err) {
      console.error("Create admin error:", err);
      res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  },

  // Admin login with JWT

loginAdmin: async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email); // Add logging for debugging
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Email and password are required' 
      });
    }

    // Find admin with password
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!admin) {
      console.log('Admin not found:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Compare passwords using the method from admin.model.js
    const isMatch = await bcrypt.compare(password, admin.password);
    
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return response without password
    const adminData = admin.toObject();
    delete adminData.password;

    res.status(200).json({
      status: 'success',
      token,
      data: { admin: adminData }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
},

  // Get current admin (JWT-based)
  getCurrentAdmin: async (req, res) => {
    try {
      const admin = await Admin.findById(req.adminId).select("-password");
      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "Admin not found",
        });
      }
  
      res.json({
        status: "success",
        data: { admin },
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  },

  // Admin logout (session-based)
  logoutAdmin: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Logout failed",
        });
      }
      res.clearCookie("connect.sid"); // Clear session cookie
      res.json({
        status: "success",
        message: "Logged out successfully",
      });
    });
  },

  // Get all admins
  getAllAdmins: async (req, res) => {
    try {
      const admins = await Admin.find({}).select("-password");
      res.json({
        status: "success",
        data: { admins },
      });
    } catch (err) {
      console.error('Get all admins error:', err);
      res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  },

  // Get single admin
  getAdmin: async (req, res) => {
    try {
      const admin = await Admin.findById(req.params.id).select("-password");
      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "Admin not found",
        });
      }
      res.json({
        status: "success",
        data: { admin },
      });
    } catch (err) {
      console.error('Get admin error:', err);
      res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  },

  // Update admin
  updateAdmin: async (req, res) => {
    try {
      const updates = req.body;
      
      // Prevent password update through this route
      if (updates.password) {
        delete updates.password;
      }
      
      const admin = await Admin.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
        select: "-password",
      });

      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "Admin not found",
        });
      }

      res.json({
        status: "success",
        data: { admin },
      });
    } catch (err) {
      console.error('Update admin error:', err);
      res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  },

  // Delete admin
  deleteAdmin: async (req, res) => {
    try {
      const admin = await Admin.findByIdAndDelete(req.params.id);
      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "Admin not found",
        });
      }
      res.json({
        status: "success",
        message: "Admin deleted",
      });
    } catch (err) {
      console.error('Delete admin error:', err);
      res.status(500).json({
        status: "error",
        message: "Server error",
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
          status: "error",
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          status: "error",
          message: "Password must be at least 6 characters",
        });
      }

      // Find admin with password
      const admin = await Admin.findById(adminId).select("+password");
      if (!admin) {
        return res.status(404).json({
          status: "error",
          message: "Admin not found",
        });
      }

      // Verify current password
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          status: "error",
          message: "Current password is incorrect",
        });
      }

      // Set new password and save
      admin.password = newPassword;
      await admin.save();

      // Return success without sensitive data
      const adminData = admin.toObject();
      delete adminData.password;

      res.json({
        status: "success",
        message: "Password updated successfully",
        data: { admin: adminData },
      });
    } catch (err) {
      console.error("Password change error:", err);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  },
};

module.exports = adminController;