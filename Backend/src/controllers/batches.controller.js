const batchesService = require("../services/batches.service");

const getAllBatches = async (req, res) => {
    try {
        const result = await batchesService.getAllBatches();

        return res.status(200).json({
            success: true,
            message: "Batches fetched successfully.",
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
    getAllBatches
};