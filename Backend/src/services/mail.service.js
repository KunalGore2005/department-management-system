const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Department Management System" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Password Reset OTP",
        html: `
            <h2>Password Reset Request</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    });
};

module.exports = {
    sendOTPEmail
};