const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    // اسم الفئة بعدة لغات
    name: {
      ar: {
        type: String,
        required: [true, "Category name (Arabic) is required"],
        trim: true,
        maxlength: [50, "Category name cannot exceed 50 characters"],
      },
      en: {
        type: String,
        required: [true, "Category name (English) is required"],
        trim: true,
        maxlength: [50, "Category name cannot exceed 50 characters"],
      },
    },

    // وصف الفئة بعدة لغات (اختياري)
    description: {
      ar: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
    },

    // رابط صورة أو أيقونة الفئة
    image: {
      type: String,
      default: "",
    },

    // حالة الفئة (مفعل/غير مفعل)
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      lowercase: true,
    },

    // لون الفئة (اختياري)
    color: {
      type: String,
      default: "#000000",
    },
  },
  {
    timestamps: true, // تاريخ الإنشاء والتعديل
  }
);

module.exports = mongoose.model("Category", categorySchema);
