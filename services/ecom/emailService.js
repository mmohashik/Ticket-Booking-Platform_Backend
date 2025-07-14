const nodemailer = require('nodemailer');

// Create a transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Send password reset email for e-commerce users
 */
const sendPasswordResetEmail = async (email, resetToken, host) => {
    const resetUrl = `http://${host}/ecom_admin/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'E-commerce Password Reset',
        html: `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your e-commerce admin account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (email, orderDetails) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Order Confirmation - E-commerce Store',
        html: `
            <h2>Order Confirmation</h2>
            <p>Thank you for your order!</p>
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${orderDetails.id}</p>
            <p><strong>Total Amount:</strong> $${orderDetails.totalAmount}</p>
            <p><strong>Status:</strong> ${orderDetails.status}</p>
            <p>We'll send you another email when your order ships.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendPasswordResetEmail,
    sendOrderConfirmationEmail
};
