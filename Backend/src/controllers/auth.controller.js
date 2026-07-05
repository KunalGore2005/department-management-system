const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
                message: "Invalid email or password",
                users: users
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
                message: "Invalid email or password",
                users: users
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

module.exports = {
    loginUser,
    logoutUser
};