const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter.
  // Using generic SMTP settings, can be configured via .env later
  // For free development testing, you can use Mailtrap or generic SMTP.
  // We'll set a standard default configuration.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_EMAIL || 'test_user',
      pass: process.env.SMTP_PASSWORD || 'test_pass',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'Onako Bigmart'} <${process.env.FROM_EMAIL || 'noreply@onakobigmart.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;
