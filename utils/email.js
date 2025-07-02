const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    // Create a transporter object using SMTP transport
    // TODO: Replace with actual SMTP server details
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Replace with your SMTP server host
      port: 587, // Replace with your SMTP server port
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'mmohashik@gmail.com', // Replace with your SMTP username
        pass: 'efva rcke nwwz xkdv' // Replace with your SMTP password
      }
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Ticket Booking Platform" <mmohashik@gmail.com>', // Replace with your sender address
      to: to,
      subject: subject,
      html: html
    });

    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
