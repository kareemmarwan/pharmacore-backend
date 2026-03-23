const asyncHandler = require("express-async-handler");
const Order = require("../models/Order.Model");
const Product = require("../models/Product.Model");

// @desc     Get Dashboard Statistics
// @route    GET /api/dashboard
// @access   Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  /* ==============================
     1️⃣ إجمالي الأرباح والإحصائيات
  ============================== */
  const totalRevenueResult = await Order.aggregate([
    { $match: { status: "delivered" } },
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" }, // لاحظ: في نموذج Order الجديد الحقل هو totalAmount
      },
    },
  ]);

  const totalRevenue = totalRevenueResult[0]?.total || 0;
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  const lowStockProducts = await Product.countDocuments({
    stockQuantity: { $lte: 10 }, // في نموذج Product الجديد الحقل هو stockQuantity
  });

  /* ==============================
     2️⃣ المبيعات الشهرية
  ============================== */
  const monthlySalesRaw = await Order.aggregate([
    { $match: { status: "delivered" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$totalAmount" },
      },
    },
    { $sort: { "_id": 1 } },
  ]);

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlySales = monthlySalesRaw.map((item) => ({
    name: monthNames[item._id],
    value: item.total,
  }));

  /* ==============================
     3️⃣ آخر 5 طلبات
  ============================== */
  const recentOrdersRaw = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("assignedDriver", "name email");

  const recentOrders = recentOrdersRaw.map((order) => ({
    id: order._id,
    customerName: order.customerName, // استخدم customerName من النموذج الجديد
    orderNumber: order._id.toString().slice(-7).toUpperCase(),
    totalAmount: order.totalAmount,
    status: order.status,
  }));

  /* ==============================
     🔥 الاستجابة النهائية
  ============================== */
  res.status(200).json({
    totalRevenue,
    totalOrders,
    totalProducts,
    lowStockProducts,
    monthlySales,
    recentOrders,
  });
});

module.exports = { getDashboardStats };









// const asyncHandler = require("express-async-handler");
// const Order = require("../models/Order.Model");
// const Product = require("../models/Product.Model");

// // @desc     Get Dashboard Statistics
// // @route    GET /api/dashboard
// // @access   Admin
// const getDashboardStats = asyncHandler(async (req, res) => {
//   /* ==============================
//      1️⃣ إجمالي الأرباح والإحصائيات
//   ============================== */
//   const totalRevenueResult = await Order.aggregate([
//     { $match: { status: "delivered" } },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$totalPrice" },
//       },
//     },
//   ]);

//   const totalRevenue = totalRevenueResult[0]?.total || 0;
//   const totalOrders = await Order.countDocuments();
//   const totalProducts = await Product.countDocuments(); // أضفنا هذا الحقل للوحة
//   const lowStockProducts = await Product.countDocuments({
//     countInStock: { $lte: 10 },
//   });

//   /* ==============================
//      2️⃣ المبيعات الشهرية (تنسيق الحقول لـ name و value)
//   ============================== */
//   const monthlySalesRaw = await Order.aggregate([
//     { $match: { status: "delivered" } },
//     {
//       $group: {
//         _id: { $month: "$createdAt" },
//         total: { $sum: "$totalPrice" },
//       },
//     },
//     { $sort: { "_id": 1 } },
//   ]);

//   const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   const monthlySales = monthlySalesRaw.map((item) => ({
//     name: monthNames[item._id], // التصميم يتوقع "name"
//     value: item.total,          // التصميم يتوقع "value"
//   }));

//   /* ==============================
//      3️⃣ آخر 5 طلبات (تنسيق الحقول لسهولة العرض)
//   ============================== */
//   const recentOrdersRaw = await Order.find()
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .populate("assignedDriver", "name"); // جلب اسم السائق أو العميل حسب موديلك

//   const recentOrders = recentOrdersRaw.map((order) => ({
//     id: order._id,
//     customerName: order.assignedDriver?.name || "Customer", // تأكد من الحقل الصحيح للاسم هنا
//     orderNumber: order._id.toString().slice(-7).toUpperCase(),
//     totalAmount: order.totalPrice,
//     status: order.status,
//   }));

//   /* ==============================
//      🔥 الاستجابة النهائية (بنفس هيكلية الـ JSON المطلوبة)
//   ============================== */
//   res.status(200).json({
//     totalRevenue,
//     totalOrders,
//     totalProducts,      // تم الإضافة
//     lowStockProducts,
//     monthlySales,       // تم التعديل لتكون مصفوفة Objects بـ name و value
//     recentOrders        // تم التعديل لتطابق الحقول المطلوبة
//   });
// });

// module.exports = { getDashboardStats };

























// const asyncHandler = require("express-async-handler");
// const Order = require("../models/Order.Model");
// const Product = require("../models/Product.Model");

// // @desc    Get Dashboard Statistics
// // @route   GET /api/dashboard
// // @access  Admin
// const getDashboardStats = asyncHandler(async (req, res) => {
//   /* ==============================
//      1️⃣ إجمالي الأرباح (Delivered Only)
//   ============================== */
//   const totalRevenueResult = await Order.aggregate([
//     { $match: { status: "delivered" } },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: "$totalPrice" },
//       },
//     },
//   ]);

//   const totalRevenue = totalRevenueResult[0]?.total || 0;

//   /* ==============================
//      2️⃣ عدد الطلبات
//   ============================== */
//   const totalOrders = await Order.countDocuments();

//   /* ==============================
//      3️⃣ المنتجات منخفضة المخزون
//   ============================== */
//   const lowStockProducts = await Product.countDocuments({
//     countInStock: { $lte: 10 },
//   });

//   /* ==============================
//      4️⃣ آخر 5 طلبات
//   ============================== */
//   const recentOrders = await Order.find()
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .select("_id totalPrice status createdAt user")
//     .populate("assignedDriver", "name email");

//   /* ==============================
//      5️⃣ المبيعات الشهرية (للرسم البياني)
//   ============================== */
//   const monthlySales = await Order.aggregate([
//     { $match: { status: "delivered" } },
//     {
//       $group: {
//         _id: { $month: "$createdAt" },
//         total: { $sum: "$totalPrice" },
//       },
//     },
//     { $sort: { "_id": 1 } },
//   ]);

//   /* ==============================
//      6️⃣ تنسيق أسماء الأشهر
//   ============================== */
//   const monthNames = [
//     "",
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   const formattedMonthlySales = monthlySales.map((item) => ({
//     month: monthNames[item._id],
//     total: item.total,
//   }));

//   /* ==============================
//      🔥 الاستجابة النهائية
//   ============================== */
//   res.status(200).json({
//     success: true,
//     data: {
//       totalRevenue,
//       totalOrders,
//       lowStockProducts,
//       recentOrders,
//       monthlySales: formattedMonthlySales,
//     },
//   });
// });

// module.exports = { getDashboardStats };
