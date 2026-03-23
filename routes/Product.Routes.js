const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProductById,
  getPublicProducts,
  getPublicProductsDiscount
} = require("../controllers/Product.Controller");
const { uploadProductImages } = require("../Utils/Uploader");
const { protect } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const setUploadFolder = require("../Utils/UploadFolder");

/*
===========================
PUBLIC ROUTES (للزبون)
===========================
*/
router.get("/public", getPublicProducts);
router.get("/discount", getPublicProductsDiscount);
router.get("/public/:id", getPublicProductById);

/*
===========================
ADMIN / OWNER ROUTES
===========================
*/
router.route("/")
  .get(protect, allowRoles("admin", "owner"), getProducts)
  .post(protect, allowRoles("admin", "owner"),setUploadFolder('products'),uploadProductImages, createProduct);

router.route("/:id")
  .get(protect, allowRoles("admin", "owner"), getProductById)
  .put(protect, allowRoles("admin", "owner"),setUploadFolder('products'), uploadProductImages, updateProduct)
  .delete(protect, allowRoles("admin", "owner"), deleteProduct);


module.exports = router;













// const express = require("express");
// const router = express.Router();

// const {
//   getProducts,
//   getProductById,
//   createProduct,
//   updateProduct,
//   deleteProduct,
//   getPublicProductById,
//   getPublicProducts
// } = require("../controllers/Product.Controller");

// const { protect } = require("../middleware/authMiddleware");
// const { allowRoles } = require("../middleware/roleMiddleware");

// /*
//   ===========================
//   Products Routes
//   ===========================
// */

// // عرض جميع المنتجات (admin + owner)
// router
//   .route("/")
//   .get(protect, allowRoles("admin", "owner"), getProducts);

// // عرض جميع المنتجات (public for anyone)
//   router
//   .route("/getPublicProducts")
//   .get( getPublicProducts);

// // إضافة منتج جديد (admin + owner)
// router
//   .route("/")
//   .post(protect, allowRoles("admin", "owner"), createProduct);

// // عرض منتج واحد
// router
//   .route("/:id")
//   .get(protect, allowRoles("admin", "owner"), getProductById);

//   //(public for anyone)
//   router
//   .route("/public/:id")
//   .get(getPublicProductById);

// // تعديل + حذف منتج
// router
//   .route("/:id")
//   .put(protect, allowRoles("admin", "owner"), updateProduct)
//   .delete(protect, allowRoles("admin", "owner"), deleteProduct);

// module.exports = router;
