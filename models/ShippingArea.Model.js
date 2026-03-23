const mongoose = require("mongoose");

const shippingAreaSchema = mongoose.Schema(
  {
    // اسم المنطقة بعدة لغات
    name: {
      ar: {
        type: String,
        required: [true, "Area name (Arabic) is required"],
        trim: true,
        maxlength: [100, "Area name cannot exceed 100 characters"],
      },
      en: {
        type: String,
        required: [true, "Area name (English) is required"],
        trim: true,
        maxlength: [100, "Area name cannot exceed 100 characters"],
      },
    },

    // المدينة (اختياري إذا أردت توسعة النظام لاحقاً)
    city: {
      type: String,
      required: true,
      trim: true,
    },

    // سعر الشحن لهذه المنطقة
    shippingCost: {
      type: Number,
      required: true,
      min: [0, "Shipping cost cannot be negative"],
      default: 0,
    },

    // ترتيب الظهور في التطبيق
    order: {
      type: Number,
      default: 0,
    },

    // حالة المنطقة
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ShippingArea", shippingAreaSchema);