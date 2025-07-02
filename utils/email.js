const nodemailer = require('nodemailer');

/**
 * Sends an email.
 * @param {string} to Recipient's email address.
 * @param {string} subject Email subject.
 * @param {string} html HTML content of the email.
 * @param {Array} attachments Array of attachment objects for Nodemailer (optional).
 *                 Example: [{ filename: 'qr.png', content: buffer, cid: 'qr_code_image' }]
 * @returns {Promise<object>} Nodemailer info object if successful.
 * @throws {Error} If email sending fails.
 */
const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports (STARTTLS on 587)
      auth: {
        user: 'mmohashik@gmail.com', // Your Gmail address
        pass: 'efva rcke nwwz xkdv'          // Your Gmail password or App Password
      }
    });

    let mailOptions = {
      from: '"Ticket Booking Platform" <mmohashik@gmail.com>',
      to: to,
      subject: subject,
      html: html,
      attachments: attachments
    };

    let info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
