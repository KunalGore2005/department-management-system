
const express = require("express");
const router = express.Router();

const facultySubjectSectionController =
    require("../controllers/facultySubjectSection.controller");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Get All Allocations
// HOD: All allocations
// Faculty: Own allocations
router.get(
    "/",
    verifyToken,
    authorizeRoles("HOD", "FACULTY"),
    facultySubjectSectionController.getAllAllocations
);

// Get Allocations By Faculty
// HOD: Any faculty
// Faculty: Own allocations only
router.get(
    "/faculty/:facultyId",
    verifyToken,
    authorizeRoles("HOD", "FACULTY"),
    facultySubjectSectionController.getAllocationsByFaculty
);

// Create Allocation
router.post(
    "/",
    verifyToken,
    authorizeRoles("HOD"),
    facultySubjectSectionController.createAllocation
);

// Update Allocation
router.patch(
    "/:allocationId",
    verifyToken,
    authorizeRoles("HOD"),
    facultySubjectSectionController.updateAllocation
);

// Delete Allocation
router.delete(
    "/:allocationId",
    verifyToken,
    authorizeRoles("HOD"),
    facultySubjectSectionController.deleteAllocation
);

module.exports = router;
