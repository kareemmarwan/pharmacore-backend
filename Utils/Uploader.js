// const multer = require("multer");
// const { v4: uuidv4 } = require("uuid");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

// // 1. استيراد إعدادات Cloudinary الخاصة بك من ملف الـ Config
// // (تأكد من صحة المسار لملف الـ config الخاص بك)
// const cloudinary = require("../config/cloudinary"); 

// // 2. إعداد وحدة التخزين الخاصة بـ Cloudinary
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req, file) => {
//     // الأولوية لـ Header اسمه 'folder' ثم الـ params
//     const subFolder = req.headers["folder"] || req.params.category || "others";

//     const ext = file.mimetype.split("/")[1]; 

//     const prefix = req.headers["folder"] || req.params.category || "file";
//     const uniqueName = `${prefix}-${uuidv4()}`;

//     return {
//       folder: `my-store/${subFolder}`, // اسم المجلد الرئيسي في كلاوديناري
//       public_id: uniqueName, 
//       format: ext === "jpeg" ? "jpg" : ext, 
//       transformation: [{ quality: "auto" }], 
//     };
//   },
// });

// // 3. إعداد Multer مع الشروط الخاصة بك
// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 ميجابايت

//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only images are allowed!"), false);
//     }
//   },
// });

// module.exports = {
//   uploadSingleImage: upload.single("image"),
//   uploadPaymentProof: upload.single("paymentProof"),
//   uploadProductImages: upload.array("images", 10),
// };





// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const { v4: uuidv4 } = require("uuid");


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // الأولوية لـ Header اسمه 'folder' ثم الـ params
//     const subFolder = req.headers['folder'] || req.params.category || "others"; 
    
//     const uploadPath = path.join("public/uploads", subFolder);

//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname).toLowerCase();
    
//     // الأولوية لـ Header اسمه 'folder' للبادئة
//     const prefix = req.headers['folder'] || req.params.category || "file";
    
//     const uniqueName = `${prefix}-${uuidv4()}${ext}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },

//   fileFilter: (req, file, cb) => {
//     // مصفوفة الصيغ المسموحة
//     const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
//     // 1. التحقق من الـ MimeType
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } 
//     // 2. التحقق من الامتداد كخيار إضافي (للاحتياط)
//     else if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
//       cb(null, true);
//     }
//     else {
//       cb(new Error("Only images are allowed!"), false);
//     }
//   },
 
// });

// module.exports = {
//   uploadSingleImage: upload.single("image"),
//   uploadPaymentProof: upload.single("paymentProof"),
//   uploadProductImages: upload.array("images", 10),
// };



const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2; // تأكد من استدعاء cloudinary

// --- 1. إعدادات Cloudinary الأساسية ---
// (يفضل وضع هذه القيم في ملف الـ .env واستدعائها عبر process.env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 2. إعداد التخزين السحابي (بديل diskStorage) ---
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // الأولوية لـ Header اسمه 'folder' ثم الـ params كما في كودك الأصلي
    const subFolder = req.headers['folder'] || req.params.category || "others";
    const prefix = req.headers['folder'] || req.params.category || "file";
    
    // توليد اسم فريد للصورة
    const uniqueName = `${prefix}-${uuidv4()}`;

    return {
      folder: `pharmastore_uploads/${subFolder}`, // سيقوم بإنشاء المجلدات تلقائياً داخل Cloudinary
      public_id: uniqueName, // اسم الملف بدون امتداد (Cloudinary يضيف الامتداد تلقائياً)
      allowed_formats: ["jpg", "jpeg", "png", "webp"], // الصيغ المسموحة
    };
  },
});

// --- 3. إعداد الـ Multer بنفس الفلاتر السابقة ---
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } 
    else if (file.originalname.match(/\.(jpg|jpeg|png|webp)$/i)) {
      cb(null, true);
    }
    else {
      cb(new Error("Only images are allowed!"), false);
    }
  },
});

// --- 4. تصدير نفس الدوال تماماً دون أي تغيير في المسميات ---
module.exports = {
  uploadSingleImage: upload.single("image"),
  uploadPaymentProof: upload.single("paymentProof"),
  uploadProductImages: upload.array("images", 10),
};