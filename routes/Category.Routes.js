const express = require("express");
const router = express.Router({ mergeParams: true });

// Controllers
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/Category.Controller");

// Middlewares
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadSingleImage } = require("../Utils/Uploader");
const setUploadFolder = require("../Utils/UploadFolder");


// 🔸 Get All Categories (Public)
router.get("/", getCategories);

// 🔸 Get Single Category (Protected)
router.get("/:id", protect, getCategoryById);

// 🔸 Create Category (Admin Only)
router.post(
  "/",
  protect,
  allowRoles("admin"),
  setUploadFolder("categories"),
  uploadSingleImage,
  createCategory,

);

// 🔸 Update Category (Admin Only)
router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  setUploadFolder("categories"),
  uploadSingleImage,
  updateCategory
);

// 🔸 Delete Category (Admin Only)
router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteCategory
);

module.exports = router;














// const express = require("express");
// const router = express.Router({ mergeParams: true });
// const {
//   getCategories,
//   getCategoryById,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } = require("../controllers/Category.Controller");
// const { protect } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware"); // إذا عندك middleware للصلاحيات
// const {   uploadProductImages, 
//   uploadSingleImage  } = require("../Utils/Uploader");
// // 🔹 جلب كل الفئات أو إنشاء فئة جديدة (Admin فقط)
// // router.route("/upload/:category").post(protect, allowRoles("admin"),uploadSingleImage, createCategory);



// // 1. إزالة :category من الرابط لتجنب تعليق النظام
// // 2. إضافة وظيفة وسيطة (Middleware) لتحديد المجلد يدوياً
// router.route("/upload-category").post(
//   protect, 
//   allowRoles("admin"),
//   (req, res, next) => {
//     // حقن القيمة يدوياً في الهيدر أو البارامتر ليراها الـ Uploader فوراً
//     req.headers['folder'] = "categories"; 
//     next();
//   },
//   uploadSingleImage, 
//   createCategory
// );

// router.route("/upload-category").put(
//   protect, 
//   allowRoles("admin"),
//   (req, res, next) => {
//     req.headers['folder'] = "categories"; 
//     next();
//   },
//   uploadSingleImage, 
//   updateCategory
// );
// router.route("/").get( getCategories)                  // الجميع يمكنه رؤية الفئات

// // 🔹 عمليات على فئة واحدة (Admin فقط)
// router.route("/:id")
//   .get(protect, getCategoryById)                   // يمكن للجميع مشاهدة فئة واحدة
//   .put(protect, allowRoles("admin"),uploadSingleImage, updateCategory); // تعديل فئة

//   router.route("/upload-category").delete(protect, allowRoles("admin"), deleteCategory); // حذف فئة


// module.exports = router;
