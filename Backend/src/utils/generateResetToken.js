const jwt = require("jsonwebtoken");

const generateResetToken = (userId, otpId) => {
    return jwt.sign(
        {
            userId,
            otpId,
            purpose: "password_reset"
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "10m"
        }
    );
};

module.exports = generateResetToken;