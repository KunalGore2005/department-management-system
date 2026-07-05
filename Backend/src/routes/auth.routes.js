const express = require('express');
const authController = require('../controllers/auth.controller');
const verifyResetToken = require("../middlewares/verifyResetToken");

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);

router.post('/reset-password/request',authController.requestPasswordReset);
router.post('/reset-password/verify',authController.verifyResetOTP);
router.post("/reset-password/confirm",verifyResetToken,authController.confirmPasswordReset);

module.exports = router;