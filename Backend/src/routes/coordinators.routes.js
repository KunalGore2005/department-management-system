const express = require("express");
const router = express.Router();

const coordinatorsController = require("../controllers/coordinators.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Assign or replace coordinator for a section/batch
router.patch( "/:sectionId/:batchId", verifyToken, authorizeRoles("HOD"), coordinatorsController.assignCoordinator);

// Get coordinator of a section/batch
router.get( "/section/:sectionId/:batchId", verifyToken, authorizeRoles("HOD", "FACULTY"), coordinatorsController.getCoordinatorBySection);

// Get all current coordinator assignments
router.get( "/", verifyToken, authorizeRoles("HOD", "FACULTY"), coordinatorsController.getAllCoordinators );

// Get coordinator by faculty ID
router.get( "/faculty/:facultyId", verifyToken, authorizeRoles("HOD", "FACULTY"), coordinatorsController.getCoordinatorByFaculty );

module.exports = router;