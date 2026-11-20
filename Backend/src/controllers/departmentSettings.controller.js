const departmentSettingsService = require("../services/departmentSettings.service");

const getDepartmentSettings = async (req, res) => {
    try {
        const result = await departmentSettingsService.getDepartmentSettings();

        return res.status(200).json({
            success: true,
            message: "Department settings fetched successfully.",
            data: result
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error."
        });
    }
};

const promoteBatch = async (req, res) => {
    try {
        const result = await departmentSettingsService.promoteBatch(req.params.batchId);

        return res.status(200).json({
            success: true,
            message: "Batch promoted successfully.",
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
    getDepartmentSettings,
    promoteBatch
};
