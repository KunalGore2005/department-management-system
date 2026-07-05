const jwt = require("jsonwebtoken");

const verifyResetToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Reset token is required."
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.purpose !== "password_reset") {
            return res.status(401).json({
                message: "Invalid reset token."
            });
        }

        req.resetData = decoded;

        next();

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            message: "Invalid or expired reset token."
        });

    }

};

module.exports = verifyResetToken;