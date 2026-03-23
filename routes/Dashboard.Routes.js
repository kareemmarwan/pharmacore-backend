const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/Dashboard.Controller");
const { protect } = require("../middleware/protect");
const { allowRoles } = require("../middleware/roleMiddleware");

// Admin Only
router.get("/", protect, allowRoles("admin"), getDashboardStats);

module.exports = router;
