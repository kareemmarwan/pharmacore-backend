

const express = require("express");
const router = express.Router();
const setUploadFolder = require("../Utils/UploadFolder");

// Controllers
const {
  createOrder,
  getOrders,
  getOrderById,
  getMyHistory,
  updateOrder,
  deleteOrder,
  acceptOrder
} = require("../controllers/Order.Controller");

// Middlewares
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadPaymentProof } = require("../Utils/Uploader");

/* =====================================================
   🔹 Routes
===================================================== */

// 🔸 Create Order (يمكن للمستخدم إنشاء طلب)
router.post("/",setUploadFolder('orders'), uploadPaymentProof, createOrder);


// هذا المسار يجب أن يكون Public لأن الزبون ليس لديه حساب
router.post("/my-history", getMyHistory);
// 🔸 Get All Orders (Admin + Driver)
router.get("/", protect, allowRoles("admin", "driver"), getOrders);
// السائق فقط هو من يستطيع الوصول لهذا الرابط
router.put('/:id/accept', protect, allowRoles('driver'), acceptOrder);
// 🔸 Single Order Operations
router
  .route("/:id")
  .get(protect, allowRoles("admin", "driver"), getOrderById)
  .put(protect, allowRoles("admin", "driver"),setUploadFolder('orders'), updateOrder)
  .delete(protect, deleteOrder);

module.exports = router;
