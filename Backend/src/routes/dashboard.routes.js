const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Get Dashboard Data
router.get( "/", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), dashboardController.getDashboard );

module.exports = router;