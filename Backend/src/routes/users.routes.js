const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Create User
router.post("/",verifyToken,authorizeRoles("HOD", "FACULTY"),usersController.createUser );

// Get All Users
router.get("/",verifyToken,authorizeRoles("HOD", "FACULTY"),usersController.getAllUsers );

// Get User By ID
router.get("/:id",verifyToken,authorizeRoles("HOD", "FACULTY"),usersController.getUserById );

// Update User
router.patch("/:id",verifyToken,authorizeRoles("HOD", "FACULTY"),usersController.updateUser );

// Activate / Deactivate User
router.patch( "/:id/status", verifyToken, authorizeRoles("HOD", "FACULTY"), usersController.updateUserStatus );

module.exports = router;