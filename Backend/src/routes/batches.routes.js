const express = require("express");
const router = express.Router();

const batchesController = require("../controllers/batches.controller");
const verifyToken = require("../middlewares/verifyToken");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.get(
    "/",
    verifyToken,
    authorizeRoles("HOD", "FACULTY"),
    batchesController.getAllBatches
);

module.exports = router;