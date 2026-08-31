const profileService = require("../services/profile.service");


// =====================================================
// Get Logged-in User Profile
// =====================================================

const getProfile = async (req, res) => {

    try {

        const result = await profileService.getProfile(
            req.user
        );

        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// Update Logged-in User Profile
// =====================================================

const updateProfile = async (req, res) => {

    try {

        const result = await profileService.updateProfile(
            req.user,
            req.body
        );

        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });

    }

};


module.exports = {
    getProfile,
    updateProfile
};