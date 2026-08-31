const dashboardService = require("../services/dashboard.service");


// =====================================================
// Get Dashboard Data
// =====================================================

const getDashboard = async (req, res) => {

    try {

        const result = await dashboardService.getDashboard(
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


module.exports = {
    getDashboard
};