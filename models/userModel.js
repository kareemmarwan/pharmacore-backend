const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    avatar: { 
      type: String, 
      default: "default-avatar.png" // صورة افتراضية
    },
    phone: { type: String },
    role: {
      type: String,
      enum: ["admin", "owner", "manager", "driver"],
      default: "driver", // قم بتغييرها هنا
    },
    driverStats: {
      totalEarnings: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      rating: { type: Number, default: 5.0 }
    },
    isActive: {
      type: Boolean,
      default: true, // للتحكم في دخول المستخدم
    },
    lastLogin: { type: Date }, // لمعرفة آخر تسجيل دخول
  },
  { timestamps: true }
);

// 🔹 Hash password قبل حفظ المستخدم
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔹 Method لمقارنة كلمة المرور عند تسجيل الدخول
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
