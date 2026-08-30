const express = require("express");
const router = express.Router();

const noticesController = require("../controllers/notices.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// Create Notice
router.post( "/", verifyToken, authorizeRoles("HOD", "FACULTY"), noticesController.createNotice );

// Get All Notices
router.get( "/", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), noticesController.getAllNotices );

// Get Notice By ID
router.get( "/:id", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), noticesController.getNoticeById );

// Update Notice
router.patch( "/:id", verifyToken, authorizeRoles("HOD", "FACULTY"), noticesController.updateNotice );

// Delete Notice
router.delete( "/:id", verifyToken, authorizeRoles("HOD", "FACULTY"), noticesController.deleteNotice );

module.exports = router;