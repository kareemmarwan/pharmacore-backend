const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Product must belong to a user"],
    },

    name: {
      ar: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      en: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    colors: [{ type: String, trim: true }],
    sizes: [{ type: String, trim: true }],

    discountPrice: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },

    soldQuantity: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    keywords: [{ type: String, trim: true }],

    productType: {
      type: String,
      enum: [
        "clothing",
        "shoes",
        "accessories",
        "cosmetics",
        "medical",
        "sportswear"
      ],
      required: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "hidden"],
      default: "active",
      lowercase: true,
    },

    images: [{ type: String }],

    // بيانات طبية إضافية
    dosage: { ar: { type: String, default: "" }, en: { type: String, default: "" } },
    frequency: { ar: { type: String, default: "" }, en: { type: String, default: "" } },
    usage: { ar: { type: String, default: "" }, en: { type: String, default: "" } },
    ingredients: { ar: { type: String, default: "" }, en: { type: String, default: "" } },
    sideEffects: { ar: { type: String, default: "" }, en: { type: String, default: "" } },


    notes: {
      ar: { type: String, trim: true, default: "" },
      en: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


module.exports = mongoose.model("Product", productSchema);



