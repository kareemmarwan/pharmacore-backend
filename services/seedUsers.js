const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User.Model"); // عدل المسار حسب مشروعك

dotenv.config();

// 🔹 اتصال بقاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected for seeding..."))
  .catch((err) => console.error(err));

const seedUsers = async () => {
  try {
    // 🔹 مسح كل المستخدمين الحاليين (اختياري، فقط للـ dev)
    await User.deleteMany();

    // 🔹 بيانات المستخدمين الجاهزة
    const users = [
      {
        name: "Admin User",
        email: "admin@example.com",
        password: "123456", // سيتم عمل hash تلقائياً
        role: "admin",
        phoneNumber: "0591234567",
      },
      {
        name: "Driver User",
        email: "driver@example.com",
        password: "123456",
        role: "driver",
        phoneNumber: "0597654321",
      },
    ];

    // 🔹 حفظ المستخدمين في القاعدة
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log("Users seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedUsers();
