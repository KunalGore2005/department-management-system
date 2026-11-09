
const facultySubjectSectionService = require("../services/facultySubjectSection.service");

// =====================================================
// Get All Allocations
// =====================================================

const getAllAllocations = async (req, res) => {
    try {
        const allocations =
            await facultySubjectSectionService.getAllAllocations(req.user);

        return res.status(200).json({
            success: true,
            message: "Faculty allocations fetched successfully.",
            count: allocations.length,
            data: allocations
        });

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error."
        });
    }
};


// =====================================================
// Get Allocations By Faculty
// =====================================================

const getAllocationsByFaculty = async (req, res) => {
    try {
        const { facultyId } = req.params;

        // Faculty can only access their own allocations
        if (req.user.role === "FACULTY") {
            const result =
                await facultySubjectSectionService.getAllAllocations(req.user);

            return res.status(200).json({
                success: true,
                message: "Faculty allocations fetched successfully.",
                count: result.length,
                data: result
            });
        }

        const result =
            await facultySubjectSectionService.getAllocationsByFaculty(facultyId);

        return res.status(200).json({
            success: true,
            message: "Faculty allocations fetched successfully.",
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


// =====================================================
// Create Allocation
// =====================================================

const createAllocation = async (req, res) => {
    try {
        const result =
            await facultySubjectSectionService.createAllocation(req.body);

        return res.status(201).json({
            success: true,
            message: "Faculty allocation created successfully.",
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


// =====================================================
// Update Allocation
// =====================================================

const updateAllocation = async (req, res) => {
    try {
        const { allocationId } = req.params;

        const result =
            await facultySubjectSectionService.updateAllocation(
                allocationId,
                req.body
            );

        return res.status(200).json({
            success: true,
            message: "Faculty allocation updated successfully.",
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


// =====================================================
// Delete Allocation
// =====================================================

const deleteAllocation = async (req, res) => {
    try {
        const { allocationId } = req.params;

        const result =
            await facultySubjectSectionService.deleteAllocation(allocationId);

        return res.status(200).json({
            success: true,
            message: "Faculty allocation deleted successfully.",
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
    getAllAllocations,
    getAllocationsByFaculty,
    createAllocation,
    updateAllocation,
    deleteAllocation
};
