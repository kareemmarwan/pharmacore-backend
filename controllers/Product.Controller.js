const asyncHandler = require("express-async-handler");
const Product = require("../models/Product.Model");
const Category = require("../models/Category.Model");
const path = require("path");
const deleteFile = require("../Utils/deleteFile");

/**
 * @desc Helper لتنسيق البيانات المرسلة للفرونت إند
 * تم تعديله ليدعم الوصول لـ categoryId.name بشكل صحيح
 */
const formatProduct = (product, lang = "ar") => {
  if (!product) return null;
  
  return {
    id: product._id,
    name: product.name?.[lang] || product.name?.ar || "",
    brand: product.brand || "PharmaCare",
    price: product.discountPrice > 0 ? product.discountPrice : product.price,
    originalPrice: product.price,
    discountPrice: product.discountPrice,
    costPrice: product.costPrice,
    stockQuantity: product.stockQuantity,
    image: product.images?.[0] || "",
    images: product.images || [],
    rating: product.rating || 0,
    reviewCount: product.reviewCount || 0,
    // الوصول للاسم من خلال الحقل الصحيح في الموديل categoryId
    categoryName: product.categoryId?.name?.[lang] || "",
    categoryId: product.categoryId?._id || product.categoryId,
    inStock: product.stockQuantity > 0,
    description: product.notes?.[lang] || "",
    dosage: product.dosage?.[lang] || "",
    frequency: product.frequency?.[lang] || "",
    type: product.productType || "",
    usage: product.usage?.[lang] || "",
    ingredients: product.ingredients?.[lang] || "",
    sideEffects: product.sideEffects?.[lang] || "",
    status: product.status || "active",
  };
};

// @desc Get all products (Private: Owner/Admin)
const getProducts = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin" && req.user.role !== "owner") {
    res.status(403);
    throw new Error("Not authorized to view products");
  }

  const { keyword, search, category, status, lang = "ar" } = req.query;
  const searchTerm = search || keyword;
  let query = {};

  // تحسين البحث: إذا كان الأدمن يطلب كل اللغات، نبحث في العربية والإنجليزية معاً
  if (searchTerm) {
    if (lang === "all") {
      query.$or = [
        { "name.ar": { $regex: searchTerm, $options: "i" } },
        { "name.en": { $regex: searchTerm, $options: "i" } }
      ];
    } else {
      query[`name.${lang}`] = { $regex: searchTerm, $options: "i" };
    }
  }
  
  if (category && category !== "all") query.categoryId = category;
  if (status) query.status = status;

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .populate("createdBy", "name email")
    .populate("categoryId", "name");

  // التعديل الجوهري هنا:
  // إذا كانت lang تساوي all، نرسل المصفوفة الخام دون تمريرها على formatProduct
  if (lang === "all") {
    return res.status(200).json(products);
  }

  // إذا كانت لغة محددة (ar أو en)، نستخدم التنسيق القديم
  const formattedProducts = products.map(p => formatProduct(p, lang));
  res.status(200).json(formattedProducts);
});


// @desc Get all products (Public)
const getPublicProducts = asyncHandler(async (req, res) => {
  const lang = req.query.lang || "ar";

  const products = await Product.find({ status: "active" })
    .sort({ createdAt: -1 })
    .populate("categoryId", "name");

  const formattedProducts = products.map(p => formatProduct(p, lang));
  res.status(200).json(formattedProducts);
});

const getPublicProductsDiscount = asyncHandler(async (req, res) => {
  const lang = req.query.lang || "ar";

  const products = await Product.find({
    status: "active",
    discountPrice: { $gt: 0 },
    $expr: {
      $lte: ["$discountPrice", { $multiply: ["$price", 0.7] }]
    }
  })
    .sort({ createdAt: -1 })
    .populate("categoryId", "name");

  const formattedProducts = products.map(p => formatProduct(p, lang));

  res.status(200).json(formattedProducts);
});

// @desc Get single product (Private)
const getProductById = asyncHandler(async (req, res) => {
  const lang = req.query.lang || "ar";

  const product = await Product.findById(req.params.id)
    .populate("createdBy", "name email")
    .populate("categoryId", "name");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json(formatProduct(product, lang));
});

// @desc Get single product (Public)
const getPublicProductById = asyncHandler(async (req, res) => {
  const lang = req.query.lang || "ar";

  const product = await Product.findOne({
    _id: req.params.id,
    status: "active",
  }).populate("categoryId", "name");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json(formatProduct(product, lang));
});

// @desc Create a new product
const createProduct = asyncHandler(async (req, res) => {
  const {
    nameAr, nameEn, categoryId, price, discountPrice, costPrice,
    stockQuantity, keywords, productType, status, notesAr, notesEn,
    brand, dosageAr, dosageEn, frequencyAr, frequencyEn,
    usageAr, usageEn, ingredientsAr, ingredientsEn, sideEffectsAr, sideEffectsEn
  } = req.body;

  // التحقق من الحقول المطلوبة
  if (!nameAr || !nameEn || !categoryId || !price || stockQuantity === undefined || !productType) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Selected category does not exist");
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => file.path.replace(/\\/g, "/").replace("public", ""));
  }

  // if (req.files && req.files.length > 0) {
  //   // 🔥 التعديل هنا: نأخذ الـ path مباشرة لأنه أصبح رابط Cloudinary (URL)
  //   images = req.files.map(file => file.path); 
  // }


  const product = await Product.create({
    name: { ar: nameAr, en: nameEn },
    categoryId,
    price,
    discountPrice: discountPrice || 0,
    costPrice: costPrice || 0,
    stockQuantity,
    keywords: keywords || [],
    productType,
    status: status || "active",
    images,
    notes: { ar: notesAr || "", en: notesEn || "" },
    brand: brand || "",
    dosage: { ar: dosageAr || "", en: dosageEn || "" },
    frequency: { ar: frequencyAr || "", en: frequencyEn || "" },
    usage: { ar: usageAr || "", en: usageEn || "" },
    ingredients: { ar: ingredientsAr || "", en: ingredientsEn || "" },
    sideEffects: { ar: sideEffectsAr || "", en: sideEffectsEn || "" },
    createdBy: req.user._id,
  });

  res.status(201).json(formatProduct(product, "en"));
});

// @desc Update a product
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // استخدام طريقة التحديث المباشر للحقول لضمان عمل المترجمات (Language objects)
  const updateData = {
    name: { 
        ar: req.body.nameAr || product.name.ar, 
        en: req.body.nameEn || product.name.en 
    },
    notes: { 
        ar: req.body.notesAr || product.notes.ar, 
        en: req.body.notesEn || product.notes.en 
    },
    dosage: { 
        ar: req.body.dosageAr || product.dosage.ar, 
        en: req.body.dosageEn || product.dosage.en 
    },
    frequency: { 
        ar: req.body.frequencyAr || product.frequency.ar, 
        en: req.body.frequencyEn || product.frequency.en 
    },
    usage: { 
        ar: req.body.usageAr || product.usage.ar, 
        en: req.body.usageEn || product.usage.en 
    },
    ingredients: { 
        ar: req.body.ingredientsAr || product.ingredients.ar, 
        en: req.body.ingredientsEn || product.ingredients.en 
    },
    sideEffects: { 
        ar: req.body.sideEffectsAr || product.sideEffects.ar, 
        en: req.body.sideEffectsEn || product.sideEffects.en 
    },
    categoryId: req.body.categoryId || product.categoryId,
    price: req.body.price ?? product.price,
    discountPrice: req.body.discountPrice ?? product.discountPrice,
    costPrice: req.body.costPrice ?? product.costPrice,
    stockQuantity: req.body.stockQuantity ?? product.stockQuantity,
    soldQuantity: req.body.soldQuantity ?? product.soldQuantity,
    keywords: req.body.keywords ?? product.keywords,
    productType: req.body.productType ?? product.productType,
    status: req.body.status ?? product.status,
    brand: req.body.brand ?? product.brand,
  };

  // معالجة الصور الجديدة إذا وجدت
  if (req.files && req.files.length > 0) {
    updateData.images = req.files.map(file => file.path.replace(/\\/g, "/").replace("public", ""));
  }


  // if (req.files && req.files.length > 0) {
  //   // 🔥 التعديل هنا أيضاً: نأخذ رابط Cloudinary مباشرة
  //   updateData.images = req.files.map(file => file.path); 
  // }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("categoryId", "name");

  res.status(200).json(formatProduct(updatedProduct, "en"));
});

// @desc Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }



  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getPublicProducts,
  getPublicProductsDiscount,
  getPublicProductById,
};


