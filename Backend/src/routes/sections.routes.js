const express = require("express");
const router = express.Router();

const sectionsController = require("../controllers/sections.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.get(
    "/",
    verifyToken,
    authorizeRoles("HOD", "FACULTY"),
    sectionsController.getAllSections
);

module.exports = router;