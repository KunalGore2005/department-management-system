const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// ======================= Faculty Routes =======================

// Start a new attendance session
router.post( "/start-session", verifyToken, authorizeRoles("HOD","FACULTY"), attendanceController.startAttendanceSession );

// Get currently active attendance session of logged-in faculty
router.get( "/active", verifyToken, authorizeRoles("HOD","FACULTY"), attendanceController.getActiveSession );

// Get details of a specific attendance session
router.get( "/session/:sessionId", verifyToken, authorizeRoles("HOD","FACULTY"), attendanceController.getSessionById );

// Live attendance updates for a session
router.get( "/session/:sessionId/live", verifyToken, authorizeRoles("HOD","FACULTY"), attendanceController.getLiveAttendance );

// End an attendance session manually
router.post( "/end-session", verifyToken, authorizeRoles("HOD","FACULTY"), attendanceController.endAttendanceSession);

// Attendance history of logged-in faculty
router.get( "/history", verifyToken, authorizeRoles("HOD","FACULTY"), attendanceController.getAttendanceHistory );

// ======================= Student Routes =======================

// Mark attendance using session code and unique number
router.post("/mark",verifyToken,authorizeRoles("STUDENT"),attendanceController.markAttendance );

// View own attendance summary
router.get( "/student", verifyToken, authorizeRoles("STUDENT"), attendanceController.getStudentAttendance);

// ======================= Faculty & HOD Routes =======================

// Attendance reports
router.get( "/report", verifyToken, authorizeRoles("HOD", "FACULTY"), attendanceController.getAttendanceReport );

module.exports = router;