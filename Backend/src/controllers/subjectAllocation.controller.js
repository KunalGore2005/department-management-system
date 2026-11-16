const subjectAllocationService = require("../services/subjectAllocation.service");

const getSubjectsByBatch = async (req, res) => {
    try {
        const { batchId } = req.params;

        const result = await subjectAllocationService.getSubjectsByBatch(batchId);

        return res.status(200).json({
            success: true,
            message: "Subjects fetched successfully.",
            data: result
        });

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error."
        });
    }
};

module.exports = {
    getSubjectsByBatch
};