const noticesService = require("../services/notices.service");

const createNotice = async (req, res) => {
    try {
        const result = await noticesService.createNotice(
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
const getAllNotices = async (req, res) => {
    try {
        const result = await noticesService.getAllNotices();

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
const getNoticeById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await noticesService.getNoticeById(id);

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
const updateNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await noticesService.updateNotice(
            req.user,
            id,
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
const deleteNotice = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await noticesService.deleteNotice(
            req.user,
            id
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

module.exports = {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice
};