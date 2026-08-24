const attendanceService = require("../services/attendance.service");

const startAttendanceSession = async (req, res) => {
    try {

        const result = await attendanceService.startAttendanceSession(
            req.user,
            req.body
        );

        return res.status(result.status).json(result);

    } catch (error) {

        console.error("Start Attendance Session Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });

    }
};
const getActiveSession = async (req, res) => {
    try {
        const result = await attendanceService.getActiveSession(
            req.user.userId
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Get Active Attendance Session Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const getSessionById = async (req, res) => {
    try {
        const result = await attendanceService.getSessionById(
            req.user,
            req.params.sessionId
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Get Attendance Session Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const getLiveAttendance = async (req, res) => {
    try {
        const result = await attendanceService.getLiveAttendance(
            req.user,
            req.params.sessionId
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Get Live Attendance Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const endAttendanceSession = async (req, res) => {
    try {
        const result = await attendanceService.endAttendanceSession(
            req.user,
            req.body.sessionId
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("End Attendance Session Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const getAttendanceHistory = async (req, res) => {
    try {
        const result = await attendanceService.getAttendanceHistory(
            req.user
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Get Attendance History Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const markAttendance = async (req, res) => {
    try {
        const result = await attendanceService.markAttendance(
            req.user.userId,
            req.body
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Mark Attendance Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const getStudentAttendance = async (req, res) => {
    try {
        const result = await attendanceService.getStudentAttendance(
            req.user.userId
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Get Student Attendance Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};
const getAttendanceReport = async (req, res) => {
    try {
        const result = await attendanceService.getAttendanceReport(
            req.user
        );

        return res.status(result.status).json(result);

    } catch (error) {
        console.error("Get Attendance Report Error:", error);

        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    startAttendanceSession,
    getActiveSession,
    getSessionById,
    getLiveAttendance,
    endAttendanceSession,
    getAttendanceHistory,
    markAttendance,
    getStudentAttendance,
    getAttendanceReport
};