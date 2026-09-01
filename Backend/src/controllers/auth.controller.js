const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateResetToken = require("../utils/generateResetToken");

const { createPasswordResetOTP, verifyPasswordResetOTP } = require("../services/otp.service");
const { sendOTPEmail } = require("../services/mail.service");

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email exists
        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // Check account status
        if (!user.is_active) {
            return res.status(403).json({
                message: "Your account has been deactivated."
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Update last login
        await pool.query(
            "UPDATE users SET last_login = NOW() WHERE user_id = ?",
            [user.user_id]
        );

        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Send token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            message: "Login successful",
            role: user.role,
            is_first_login: user.is_first_login
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token");

    return res.status(200).json({
        message: "Logged out successfully"
    });
};

const requestPasswordReset = async (req, res) => {
    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required."
            });
        }

        const [users] = await pool.query(
            "SELECT user_id FROM users WHERE email = ? AND is_active = TRUE",
            [email]
        );

        // Always return the same response
        if (users.length === 0) {
            return res.status(200).json({
                message: "If the account exists, an OTP has been sent."
            });
        }

        const user = users[0];

        const otp = await createPasswordResetOTP(user.user_id);

        await sendOTPEmail(email, otp);

        return res.status(200).json({
            message: "OTP sent successfully."
        });

    } catch (error) {

        if (
            error.message ===
            "An OTP has already been sent. Please wait until it expires."
        ) {

            return res.status(429).json({
                message: error.message
            });

        }
        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
};

const verifyResetOTP = async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required."
            });
        }

        const [users] = await pool.query(
            `SELECT user_id
             FROM users
             WHERE email = ?
             AND is_active = TRUE`,
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message: "Invalid email or OTP."
            });
        }

        const result = await verifyPasswordResetOTP(
            users[0].user_id,
            otp
        );

        if (!result.success) {
            return res.status(400).json({
                message: result.message
            });
        }

        const resetToken = generateResetToken(
            users[0].user_id,
            result.otpId
        );

        return res.status(200).json({
            message: "OTP verified successfully.",
            resetToken
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

const confirmPasswordReset = async (req, res) => {

    const connection = await pool.getConnection();

    try {

        await connection.beginTransaction();

        const { newPassword } = req.body;

        if (!newPassword) {
            await connection.rollback();
            connection.release();

            return res.status(400).json({
                message: "New password is required."
            });
        }

        if (newPassword.length < 8) {
            await connection.rollback();
            connection.release();

            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        const { userId, otpId } = req.resetData;

        const [otpRows] = await connection.query(
            `SELECT *
            FROM password_reset_otps
            WHERE otp_id = ?
            AND user_id = ?
            AND verified = TRUE
            AND used = FALSE`,
            [otpId, userId]
        );

        if (otpRows.length === 0) {

            await connection.rollback();
            connection.release();

            return res.status(400).json({
                message: "Invalid or expired reset session."
            });

        }
        if (newPassword.length < 8) {
            await connection.rollback();
            connection.release();

            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await connection.query(
            `UPDATE users
     SET password_hash = ?,
         is_first_login = FALSE
     WHERE user_id = ?`,
            [passwordHash, userId]
        );

        await connection.query(
            `UPDATE password_reset_otps
     SET used = TRUE
     WHERE user_id = ?`,
            [userId]
        );

        await connection.commit();

        connection.release();

        res.clearCookie("token");

        return res.status(200).json({
            message: "Password reset successfully."
        });

        if (!newPassword) {

            await connection.rollback();

            connection.release();

            return res.status(400).json({
                message: "New password is required."
            });

        }

    } catch (error) {

        if (connection) {
            await connection.rollback();
            connection.release();
        }

        console.error(error);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    loginUser,
    logoutUser,
    requestPasswordReset,
    verifyResetOTP,
    confirmPasswordReset
};