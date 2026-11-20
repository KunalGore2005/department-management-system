const marksService = require("../services/marks.service");

const createExam = async (req, res) => {
    try {
        const result = await marksService.createExam(
            req.user,
            req.body
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
const getExams = async (req, res) => {
    try {
        const result = await marksService.getExams(req.user);

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
const getExamById = async (req, res) => {
    try {
        const { examId } = req.params;

        const result = await marksService.getExamById(examId, req.user);

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
const getSubjects = async (req, res) => {
    try {
        const result = await marksService.getSubjects(req.query.batchId, req.query.semester);
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
const getAssignments = async (req, res) => {
    try {
        const result = await marksService.getAssignments(req.user);
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
const getExamStudents = async (req, res) => {
    try {
        const result = await marksService.getExamStudents(req.user, req.params.examId, req.query.subjectId, req.query.sectionId);
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};
const updateExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const result = await marksService.updateExam(
            req.user,
            examId,
            req.body
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
const deleteExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const result = await marksService.deleteExam(examId);

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
const uploadMarks = async (req, res) => {
    try {
        const result = await marksService.uploadMarks(
            req.user,
            req.body
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
const getMarks = async (req, res) => {
    try {
        const result = await marksService.getMarks(
            req.user,
            req.query
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
const updateMarks = async (req, res) => {
    try {
        const { markId } = req.params;

        const result = await marksService.updateMarks(
            req.user,
            markId,
            req.body
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
const deleteMarks = async (req, res) => {
    try {
        const { markId } = req.params;

        const result = await marksService.deleteMarks(markId);

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

module.exports = {
    createExam,
    getExams,
    getExamById,
    getSubjects,
    getAssignments,
    getExamStudents,
    updateExam,
    deleteExam,
    uploadMarks,
    getMarks,
    updateMarks,
    deleteMarks
};
