const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail
// Note: Requires EMAIL_USER and EMAIL_PASS (App Password) in .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Sends an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} html - HTML email body (optional)
 * @returns {Promise} Resolves when email is sent
 */
const sendEmail = async (to, subject, text, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS not set in .env. Skipping email send.');
        console.log(`[EMAIL MOCK] To: ${to} | Subject: ${subject}`);
        console.log(`[EMAIL MOCK] Content: ${text}`);
        return Promise.resolve(true); // Mock success so flow doesn't break during dev
    }

    const mailOptions = {
        from: `"Stag.io Support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html
    };

    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendEmail
};
