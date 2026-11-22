const studentSignupService = require("../services/studentSignup.service");

const getOptions = async (req, res) => {
    try {
        const result = await studentSignupService.getOptions();
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const createRequest = async (req, res) => {
    try {
        const result = await studentSignupService.createRequest(req.body || {});
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const result = await studentSignupService.getRequests(req.query.status);
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

const reviewRequest = async (req, res) => {
    try {
        const result = await studentSignupService.reviewRequest(req.params.requestId, req.body?.status);
        return res.status(result.statusCode).json({ success: true, message: result.message, data: result.data });
    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
};

module.exports = { getOptions, createRequest, getRequests, reviewRequest };
