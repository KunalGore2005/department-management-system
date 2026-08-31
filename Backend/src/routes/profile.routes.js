const express = require("express");
const router = express.Router();

const profileController = require("../controllers/profile.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Get Logged-in User Profile
router.get( "/", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), profileController.getProfile );

// Update Logged-in User Profile
router.patch( "/", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), profileController.updateProfile );

module.exports = router;