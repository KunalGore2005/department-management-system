const express = require("express");
const router = express.Router();

const departmentSettingsController = require("../controllers/departmentSettings.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.get(
    "/",
    verifyToken,
    authorizeRoles("HOD"),
    departmentSettingsController.getDepartmentSettings
);

router.patch(
    "/:batchId/promote",
    verifyToken,
    authorizeRoles("HOD"),
    departmentSettingsController.promoteBatch
);

module.exports = router;
