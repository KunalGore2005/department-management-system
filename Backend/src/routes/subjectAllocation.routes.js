const express = require("express");
const router = express.Router();

const subjectAllocationController = require("../controllers/subjectAllocation.controller");

const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.get(
    "/:batchId",
    verifyToken,
    authorizeRoles("HOD"),
    subjectAllocationController.getSubjectsByBatch
);

module.exports = router;