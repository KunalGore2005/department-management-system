const coordinatorsService = require("../services/coordinators.service");

const assignCoordinator = async (req, res) => {
    try {
        const { sectionId, batchId } = req.params;
        const { facultyId } = req.body;

        const result = await coordinatorsService.assignCoordinator(
            sectionId,
            batchId,
            facultyId
        );

        return res.status(result.statusCode).json({
            success: true,
            message: result.message,
            data: result.data || {}
        });

    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
        });
    }
};

const getCoordinatorBySection = async (req, res) => {
    try {
        const { sectionId, batchId } = req.params;

        const result = await coordinatorsService.getCoordinatorBySection(
            sectionId,
            batchId
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

const getAllCoordinators = async (req, res) => {
    try {

        const result = await coordinatorsService.getAllCoordinators();

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

const getCoordinatorByFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const result = await coordinatorsService.getCoordinatorByFaculty(facultyId);

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
    assignCoordinator,
    getCoordinatorBySection,
    getAllCoordinators,
    getCoordinatorByFaculty
};