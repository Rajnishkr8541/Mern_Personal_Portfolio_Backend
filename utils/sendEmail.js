import nodemailer from "nodemailer";

// Function to send an email
export const sendEmail = async(options) => {
    // Create a transporter for sending emails using SMTP
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST, // SMTP server host
        port: process.env.SMTP_PORT, // SMTP server port
        service: process.env.SMTP_SERVICE, // Email service (e.g., Gmail, Yahoo)
        auth: {
            user: process.env.SMTP_MAIL, // Sender's email address
            pass: process.env.SMTP_PASSWORD, // Sender's email password or app-specific password
        },
    });

    // Email options including sender, recipient, subject, and message
    const mailOptions = {
        from: process.env.SMTP_MAIL, // Sender's email address
        to: options.email, // Recipient's email address
        subject: options.subject, // Subject of the email
        text: options.message, // Email body (plain text)
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};
