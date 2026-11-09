const sectionsService = require("../services/sections.service");

const getAllSections = async (req, res) => {
    try {
        const result = await sectionsService.getAllSections();

        return res.status(200).json({
            success: true,
            message: "Sections fetched successfully.",
            data: result
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error."
        });
    }
};

module.exports = {
    getAllSections
};