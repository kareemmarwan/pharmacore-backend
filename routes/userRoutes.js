const express = require("express");
const router = express.Router();
const {
  getUsers,
  registerUser,
  loginUser,
  updateUser,
  getDrivers,
  deleteUser,
  requestCoach,
  approveStudent,
  getMe,
  sendCode,
  newPassword,
  confirmCode,
  logoutUser,
  refreshToken,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware"); // يفضل توحيدها مع allowRoles
const { allowRoles } = require("../middleware/roleMiddleware");

// ==========================================
// 1. Public Routes (لا تحتاج تسجيل دخول)
// ==========================================
router.post("/register",protect, allowRoles("admin"), registerUser);
router.post("/login", loginUser);
router.post("/send-code", sendCode);
router.post("/new-password", newPassword);
router.post("/confirm-code", confirmCode);
router.post("/logout", logoutUser);
router.get("/refresh-token", refreshToken);

// ==========================================
// 2. Private Routes (تحتاج توكن - protect)
// ==========================================
router.get("/me", protect, getMe);
router.put("/request-coach", protect, requestCoach);
router.put("/approve-student/:studentId", protect, approveStudent);

// ==========================================
// 3. Admin Routes (تحتاج توكن + صلاحية أدمن)
// ==========================================
// ملاحظة: تم وضع المسارات الثابتة قبل المسارات التي تحتوي على ID
router.get("/drivers", protect, allowRoles("admin"), getDrivers); 
router.get("/get-users", protect, allowRoles("admin"), getUsers);
router.put("/update-user/:id", protect, allowRoles("admin"), updateUser);
router.delete("/delete-user/:id", protect, allowRoles("admin"), deleteUser);

module.exports = router;





// const express = require("express");
// const router = express.Router();
// const {
//   getUsers,
//   registerUser,
//   loginUser,
//   updateUser,
//   getDrivers,
//   deleteUser,
//   requestCoach,
//   approveStudent,
//   getMe,
//   sendCode,
//   newPassword,
//   confirmCode,
//   logoutUser,
//   refreshToken,
// } = require("../controllers/userController");

// const { protect } = require("../middleware/authMiddleware");
// const { admin } = require("../middleware/adminMiddleware");
// const { uploadFiles } = require("../Utils/Uploader");
// const { allowRoles } = require("../middleware/roleMiddleware");

// // Public Routes
// router.post("/register",registerUser);
// router.post("/login", loginUser);
// router.post("/send-code", sendCode);
// router.post("/new-password", newPassword);
// router.post("/confirm-code", confirmCode);
// router.post("/logout", logoutUser);


// // Protected Routes
// router.get("/me", protect, getMe);
// router.get("/refresh-token", refreshToken);

// // Admin routes with descriptive paths
// router.get("/get-users", protect, admin, getUsers);
// router.put("/update-user/:id", protect, admin, updateUser);
// router.delete("/delete-user/:id", protect, admin, deleteUser);
// router.get("/drivers", protect, allowRoles("admin"), getDrivers);


// // Student requests a coach
// router.put("/request-coach", protect, requestCoach);

// // Coach approves/rejects student
// router.put("/approve-student/:studentId", protect, approveStudent);

// module.exports = router;
