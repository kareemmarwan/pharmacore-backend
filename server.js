require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");
const seedAdminAndDriver = require("./Utils/seed"); // استدعاء ملف الـ Seed

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  console.log("✅ MongoDB connected");

  // 🔹 استدعاء Seed بعد الاتصال بالقاعدة
  seedAdminAndDriver();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("❌ DB connection failed:", err);
});








