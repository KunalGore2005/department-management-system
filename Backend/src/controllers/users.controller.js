const usersService = require("../services/users.service");

const createUser = async (req, res) => {
    try {
        const result = await usersService.createUser(
            req.user,
            req.body
        );

        return res.status(201).json(result);

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {

    try {

        const users = await usersService.getAllUsers(req.query);

        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

const getUserById = async (req, res) => {

    try {

        const { id } = req.params;

        const user = await usersService.getUserById(id);

        return res.status(200).json({
            success: true,
            user
        });

    } catch (error) {

        console.error(error);

        return res.status(404).json({
            success: false,
            message: error.message
        });

    }

};

const updateUser = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await usersService.updateUser(
            id,
            req.user,
            req.body
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

const updateUserStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { is_active } = req.body;

        const result = await usersService.updateUserStatus(
            id,
            req.user.userId,
            req.user.role,
            is_active
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error(error);

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserStatus
};