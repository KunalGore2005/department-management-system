const bcrypt = require("bcrypt");
const pool = require("../config/db");
const generateOTP = require("../utils/generateOTP");

const createPasswordResetOTP = async (userId) => {

    const [existingOTP] = await pool.query(
        `SELECT expires_at
     FROM password_reset_otps
     WHERE user_id = ?
     AND used = FALSE
     ORDER BY created_at DESC
     LIMIT 1`,
        [userId]
    );

    if (
        existingOTP.length > 0 &&
        new Date(existingOTP[0].expires_at) > new Date()
    ) {
        throw new Error(
            "An OTP has already been sent. Please wait until it expires."
        );
    }
    // Delete any previous unused OTPs
    await pool.query(
        "DELETE FROM password_reset_otps WHERE user_id = ?",
        [userId]
    );

    // Generate OTP
    const otp = generateOTP();

    // Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Expiry time (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save to DB
    await pool.query(
        `INSERT INTO password_reset_otps
        (user_id, otp_hash, expires_at)
        VALUES (?, ?, ?)`,
        [userId, otpHash, expiresAt]
    );

    return otp;
};


const verifyPasswordResetOTP = async (userId, enteredOTP) => {

    const [rows] = await pool.query(
        `SELECT *
        FROM password_reset_otps
        WHERE user_id = ?
        AND verified = FALSE
        AND used = FALSE
        ORDER BY created_at DESC
        LIMIT 1`,
        [userId]
    );

    if (rows.length === 0) {
        return {
            success: false,
            message: "No OTP request found."
        };
    }

    const otpRecord = rows[0];

    if (new Date() > otpRecord.expires_at) {
        return {
            success: false,
            message: "OTP has expired."
        };
    }

    const isValid = await bcrypt.compare(
        enteredOTP,
        otpRecord.otp_hash
    );

    if (!isValid) {
        return {
            success: false,
            message: "Invalid OTP."
        };
    }

    await pool.query(
        `UPDATE password_reset_otps
         SET verified = TRUE
         WHERE otp_id = ?`,
        [otpRecord.otp_id]
    );

    return {
        success: true,
        otpId: otpRecord.otp_id
    };
};

module.exports = {
    createPasswordResetOTP,
    verifyPasswordResetOTP
};