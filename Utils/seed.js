const User = require("../models/userModel"); // عدل حسب مسارك

const seedAdminAndDriver = async () => {
  try {
    // تحقق إذا موجود Admin
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      const admin = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "123456", // سيعمل hash تلقائياً لو عندك pre-save
        role: "admin",
        phoneNumber: "0591234567",
      });
      await admin.save();
      console.log("Admin created ✅");
    }

    // تحقق إذا موجود Driver
    const driverExists = await User.findOne({ role: "driver" });
    if (!driverExists) {
      const driver = new User({
        name: "Driver User",
        email: "driver@example.com",
        password: "123456",
        role: "driver",
        phoneNumber: "0597654321",
      });
      await driver.save();
      console.log("Driver created ✅");
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
};

module.exports = seedAdminAndDriver;
