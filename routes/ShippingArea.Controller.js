const express = require("express");
const router = express.Router({ mergeParams: true });

// Controllers
const {
  getShippingAreas,
  getShippingAreaById,
  createShippingArea,
  updateShippingArea,
  deleteShippingArea,
} = require("../controllers/ShippingArea.Controller");

// Middlewares
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");


// 🔸 Get All Shipping Areas (Public)
router.get("/", getShippingAreas);

// 🔸 Get Single Shipping Area
router.get("/:id", protect, getShippingAreaById);

// 🔸 Create Shipping Area (Admin Only)
router.post(
  "/",
  protect,
  allowRoles("admin"),
  createShippingArea
);

// 🔸 Update Shipping Area (Admin Only)
router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  updateShippingArea
);

// 🔸 Delete Shipping Area (Admin Only)
router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteShippingArea
);

module.exports = router;