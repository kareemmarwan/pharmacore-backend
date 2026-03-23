const asyncHandler = require("express-async-handler");
const Category = require("../models/Category.Model");
const path = require("path");
const deleteFile = require("../Utils/deleteFile");
// @desc Get all categories
// @route GET /api/categories
// @access Private (Admin only if تريد)
const getCategories = asyncHandler(async (req, res) => {
  // جلب الفئات بالكامل من قاعدة البيانات
  const categories = await Category.find();

  // إرجاع البيانات كما هي (بما فيها كائنات اللغات)
  // أو إعادة تشكيلها لضمان وصول الحقول المطلوبة فقط
  const formattedCategories = categories.map(cat => ({
    _id: cat._id,
    name: cat.name, // سيعود كـ { ar: "...", en: "..." }
    description: cat.description, // سيعود كـ { ar: "...", en: "..." }
    image: cat.image,
    color: cat.color,
    status: cat.status,
    createdAt: cat.createdAt
  }));

  res.status(200).json(formattedCategories);
});





// @desc Get single category
// @route GET /api/categories/:id
// @access Private
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const lang = req.query.lang || "ar";
  const formattedCategory = {
    _id: category._id,
    name: category.name[lang],
    description: category.description[lang],
    image: category.image,
    color: category.color,
    status: category.status
  };

  res.status(200).json(formattedCategory);
});



// @desc Create category
// @route POST /api/categories
// @access Private (Admin)
// const createCategory = asyncHandler(async (req, res) => {
//   const { nameAr, nameEn, descriptionAr, descriptionEn, status, color } = req.body;

//   // التحقق من الاسم بالعربية والإنجليزية
//   if (!nameAr || !nameEn) {
//     res.status(400);
//     throw new Error("Category name in both languages is required");
//   }

//   // التأكد من عدم وجود فئة بنفس الاسم العربي أو الإنجليزي
//   const existing = await Category.findOne({ 
//     $or: [
//       { "name.ar": nameAr },
//       { "name.en": nameEn }
//     ]
//   });
//   if (existing) {
//     res.status(400);
//     throw new Error("Category already exists");
//   }

//   // التعامل مع الصورة
//   let imagePath = "";
//   if (req.file) {
//     imagePath = req.file.path.replace(/\\/g, "/").replace("public", "");
//   }

//   const category = await Category.create({
//     name: { ar: nameAr, en: nameEn },
//     description: { ar: descriptionAr || "", en: descriptionEn || "" },
//     status: status || "active",
//     image: imagePath,
//     color: color || "#000000",
//   });

//   res.status(201).json(category);
// });


const createCategory = asyncHandler(async (req, res) => {
  const { nameAr, nameEn, descriptionAr, descriptionEn, status, color } = req.body;

  // التحقق من الاسم بالعربية والإنجليزية
  if (!nameAr || !nameEn) {
    res.status(400);
    throw new Error("Category name in both languages is required");
  }

  // التأكد من عدم وجود فئة بنفس الاسم العربي أو الإنجليزي
  const existing = await Category.findOne({ 
    $or: [
      { "name.ar": nameAr },
      { "name.en": nameEn }
    ]
  });
  if (existing) {
    res.status(400);
    throw new Error("Category already exists");
  }

  // --- التعامل مع الصورة (متوافق مع التخزين السحابي والمحلي) ---
  let imagePath = "";
  if (req.file) {
    // إذا كان الرابط يبدأ بـ http فهذا يعني أنه مرفوع على كلاود ونخزنه مباشرة
    if (req.file.path.startsWith('http')) {
      imagePath = req.file.path; 
    } else {
      // كود الأمان القديم الخاص بك في حال قررت العودة للتخزين المحلي مستقبلاً
      imagePath = req.file.path.replace(/\\/g, "/").replace("public", "");
    }
  }

  const category = await Category.create({
    name: { ar: nameAr, en: nameEn },
    description: { ar: descriptionAr || "", en: descriptionEn || "" },
    status: status || "active",
    image: imagePath, // سيتم حفظ الرابط السحابي المباشر هنا
    color: color || "#000000",
  });

  res.status(201).json(category);
});


// @desc Update category
// @route PUT /api/categories/:id
// @access Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const { nameAr, nameEn, descriptionAr, descriptionEn, status, color } = req.body;

  if (nameAr) category.name.ar = nameAr;
  if (nameEn) category.name.en = nameEn;
  if (descriptionAr !== undefined) category.description.ar = descriptionAr;
  if (descriptionEn !== undefined) category.description.en = descriptionEn;
  if (status) category.status = status;
  if (color) category.color = color;

  // تحديث الصورة إذا تم رفع ملف جديد
  if (req.file) {
    category.image = req.file.path.replace(/\\/g, "/").replace("public", "");
  }

  const updatedCategory = await category.save();
  res.status(200).json(updatedCategory);
});



// @desc Delete category
// @route DELETE /api/categories/:id
// @access Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }



  if (category.image) {
    const imagePath = path.join(
      process.cwd(),
      category.image.replace(/^\//, "")
    );
    deleteFile(imagePath);
  }


  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});




module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
