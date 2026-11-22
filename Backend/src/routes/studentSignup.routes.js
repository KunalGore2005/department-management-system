const express = require("express");
const studentSignupController = require("../controllers/studentSignup.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post("/", studentSignupController.createRequest);
router.get("/options", studentSignupController.getOptions);
router.get("/", verifyToken, authorizeRoles("HOD"), studentSignupController.getRequests);
router.patch("/:requestId", verifyToken, authorizeRoles("HOD"), studentSignupController.reviewRequest);

module.exports = router;
