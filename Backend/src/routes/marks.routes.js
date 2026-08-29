const express = require("express");
const router = express.Router();

const marksController = require("../controllers/marks.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

// =====================================================
// EXAM MANAGEMENT
// =====================================================

// Create Exam
// Only HOD can create an exam
router.post( "/exams", verifyToken, authorizeRoles("HOD"), marksController.createExam );

// Get All Exams
// All authenticated users can view exams
router.get( "/exams", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), marksController.getExams );

// Get Exam By ID
// All authenticated users can view a specific exam
router.get( "/exams/:examId", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), marksController.getExamById );

// Update Exam
// Only HOD can update an exam
router.patch( "/exams/:examId", verifyToken, authorizeRoles("HOD"), marksController.updateExam );

// Delete Exam
// Only HOD can delete an exam
router.delete( "/exams/:examId", verifyToken, authorizeRoles("HOD"), marksController.deleteExam );


// =====================================================
// MARKS MANAGEMENT
// =====================================================

// Upload / Save MST Marks
// Faculty and HOD can upload marks
router.post( "/", verifyToken, authorizeRoles("FACULTY", "HOD"), marksController.uploadMarks );

// Get Marks
// Student, Faculty and HOD can view marks
// GET /marks
// GET /marks?examId=1
// GET /marks?subjectId=5
// GET /marks?studentId=101
// GET /marks?examId=1&subjectId=5
router.get( "/", verifyToken, authorizeRoles("STUDENT", "FACULTY", "HOD"), marksController.getMarks );

// Update Marks
// Faculty and HOD can update marks
router.patch( "/:markId", verifyToken, authorizeRoles("FACULTY", "HOD"), marksController.updateMarks );

// Delete Marks
// Only HOD can delete marks
router.delete( "/:markId", verifyToken, authorizeRoles("HOD"), marksController.deleteMarks );

module.exports = router;