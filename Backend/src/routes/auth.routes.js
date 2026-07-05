const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);

router.post('/send-otp',)

module.exports = router;