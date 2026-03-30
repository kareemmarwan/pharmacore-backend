const asyncHandler = require("express-async-handler");
const Order = require("../models/Order.Model");
const Product = require("../models/Product.Model");
const User = require('../models/userModel')

// @desc Create new order
// @route POST /api/orders
// @access Public
const createOrder = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    customerIdNumber,
    customerEmail,
    products,
    shippingCost,
    totalAmount,
  } = req.body;

  console.log('start first steps')

  if (!customerName || !customerPhone || !customerAddress ||!customerEmail ||!products ||!shippingCost || !totalAmount || !customerIdNumber) {
    res.status(400);
    throw new Error("All fields are required");
  }
 

  let paymentProofPath = "";
  if (req.file) {
    paymentProofPath = req.file.path.replace(/\\/g, "/").replace("public", "");
  }

  const parsedProducts = typeof products === "string" ? JSON.parse(products) : products;

  // ✅ جلب البيانات وتخزين السعر والكمية والـ ID فقط (الاحترافية في التخزين)
  const orderProducts = await Promise.all(
    parsedProducts.map(async p => {
      const productDoc = await Product.findById(p.productId);
      if (!productDoc) throw new Error(`Product not found: ${p.productId}`);

      return {
        productId: p.productId,
        price: p.price,
        color: p.selectedColor || p.color, // دعم المسميين لضمان المرونة
        size: p.selectedSize || p.size,
        quantity: p.quantity,
      };
    })
  );

  const order = await Order.create({
    customerName,
    customerPhone,
    customerAddress,
    customerIdNumber,
    customerEmail,
    products: orderProducts,
    shippingCost: Number(shippingCost) || 0,
    totalAmount,
    paymentProof: paymentProofPath,
    status: "pending",
    // ملاحظة: الـ orderNumber يتم توليده تلقائياً في الـ Schema كما فعلنا سابقاً
  });
  res.status(201).json(order);
});

// @desc Get all orders
// @route GET /api/orders



// @desc Get orders (Admin gets all, Driver gets their assigned orders with specific statuses)
// @route GET /api/orders
const getOrders = asyncHandler(async (req, res) => {
  const { status, lang } = req.query;
  const language = lang || "ar";

  let query = {};
  
  if (req.user.role === "admin") {
    // 1. منطق الأدمن: يرى كل الطلبات ويمكنه الفلترة بأي حالة يختارها
    if (status && status !== "all") {
      query.status = status;
    
    }
  } else if (req.user.role === "driver") {


    // 2. منطق السائق:
    // أولاً: يجب أن يكون الطلب مسنداً إليه حصراً
    // query.assignedDriver = new mongoose.Types.ObjectId(req.user._id);
// التعديل: تحويل المعرف لنص لضمان التوافق وعدم انهيار الكود
query.assignedDriver = req.user._id.toString();
    // ثانياً: حصر الحالات التي يمكن للسائق رؤيتها فقط
    const allowedStatuses = ["assigned","accepted", "onDelivery", "delivered"];

    if (status && status !== "all" && allowedStatuses.includes(status)) {
      // إذا طلب السائق حالة معينة (مثل التوصيلات السابقة 'delivered')
      query.status = status;
    } else {
      // إذا لم يحدد حالة أو طلب 'all'، نعرض له فقط الحالات المسموحة له
      query.status = { $in: allowedStatuses };
    }
  }
  // طباعة الكوري للتصحيح (اختياري)
  const orders = await Order.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: "products.productId",
      populate: { path: "categoryId", select: "name" }
    })
    .populate("assignedDriver", "name email");

  // ✅ التنسيق ليتوافق مع واجهة Expo
  const formattedOrders = orders.map(order => ({
    id: order.orderNumber, // الرقم الاحترافي (ORD-XXXX)
    dbId: order._id,      // المعرف الأصلي لقاعدة البيانات
    date: new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }),
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    customerEmail: order.customerEmail,
    // data for drier
    assignedDriver: order.assignedDriver ? {
      id: order.assignedDriver._id,
      name: order.assignedDriver.name,
      email: order.assignedDriver.email
    } : null,

    // for product
    items: order.products.map(p => ({
      product: {
        _id: p.productId?._id,
        name: p.productId?.name?.[language] || "Deleted Product",
        category: p.productId?.categoryId?.name?.[language] || p.productId?.category?.name?.[language],
        image: p.productId?.image
      },
      price: p.price,
      color:p.color,
      size:p.size,
      quantity: p.quantity
    })),
    shippingCost:order.shippingCost,
    total: order.totalAmount,

    paymentProof: order.paymentProof
  }));

  res.json(formattedOrders);
});




// @desc Get single order
// @route GET /api/orders/:id
// @access Private (Admin & Driver)
const getOrderById = asyncHandler(async (req, res) => {
  const lang = req.query.lang || "ar";
  // 1. جلب الطلب مع عمل populate للمنتجات (لجلب بياناتها من مودل Product) وللسائق
  const order = await Order.findById(req.params.id)
    .populate({
      path: "products.productId",
      populate: { path: "categoryId", select: "name" } // جلب اسم الفئة أيضاً
    })
    .populate("assignedDriver", "name email");



  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // 2. التحقق من صلاحيات السائق (إذا كان سائقاً، يجب أن يكون الطلب محولاً إليه)
  if (req.user.role === "driver" && order.assignedDriver?._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Access denied: You are not assigned to this order");
  }

  // 3. تنسيق البيانات لتطابق واجهة الموبايل (Expo) كما فعلنا في getOrders
  const formattedOrder = {
    id: order.orderNumber, // الرقم الاحترافي ORD-XXXX
    dbId: order._id,      // المعرف الأصلي
    date: order.createdAt.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    customerIdNumber: order.customerIdNumber,
    customerEmail:order.customerEmail,
    // تحويل المنتجات لتكون داخل items كما تتوقع الواجهة
    items: order.products.map(p => ({
      product: {
        _id: p.productId?._id,
        name: p.productId?.name[lang] || "Deleted Product",
        category: p.productId?.category?.name[lang],
        image: p.productId?.image,
        // يمكنك إضافة أي تفاصيل أخرى من مودل المنتج هنا
      },
      price: p.price, 
      color:p.color,
      size:p.size,
      quantity: p.quantity,
    })),
    total: order.totalAmount,
    shippingCost:order.shippingCost|| 0 ,
    shipping: order.shippingCost || 0,
    paymentProof: order.paymentProof,
    assignedDriver: order.assignedDriver,
  };

  res.json(formattedOrder);
});

// @desc Get orders by list of IDs (للتتبع من قبل الزبون الضيف)
// @route POST /api/orders/my-history
const getMyHistory = asyncHandler(async (req, res) => {
  const { ids, lang = "ar" } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(200).json([]);
  }

  const orders = await Order.find({ _id: { $in: ids } })
    .sort({ createdAt: -1 })
    .populate({
      path: "products.productId",
      populate: { path: "categoryId" },
      select: "name images price",
    });

  const formattedOrders = orders.map(order => ({
    id: order.orderNumber,
    dbId: order._id,
    date: order.createdAt,
    status: order.status,
    items: order.products.map(p => ({
      product: {
        name: p.productId?.name?.[lang], // 👈 سيعمل الآن
        image: p.productId?.images?.[0] || null,
      },
      quantity: p.quantity,
      price: p.price,
      color:p.color,
      size:p.size
    })),
    shippingCost:order.shippingCost,
    total: order.totalAmount
  }));


  res.json(formattedOrders);
});

// @desc Update order
const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { 
    res.status(404); 
    throw new Error("Order not found"); 
  }

  const { status, assignedDriver } = req.body;
  
  // حفظ الحالة القديمة للمقارنة لاحقاً (لمنع تكرار إضافة الأرباح)
  const previousStatus = order.status;

  if (req.user.role === "admin") {
    if (status) order.status = status;
    if (assignedDriver) order.assignedDriver = assignedDriver;
  } else if (req.user.role === "driver") {
    if (order.assignedDriver?.toString() !== req.user._id.toString()) {
      res.status(403); 
      throw new Error("Not assigned to you");
    }
    if (status) order.status = status;
  }

  // --- المنطق المضاف لتحديث أرباح السائق ---
  // نتحقق: هل الحالة الجديدة "delivered" والحالة القديمة لم تكن كذلك؟ وهل هناك سائق معين؟
  if (order.status === 'delivered' && previousStatus !== 'delivered' && order.assignedDriver) {
    await User.findByIdAndUpdate(order.assignedDriver, {
      $inc: { 
        "driverStats.totalEarnings": order.shippingCost, 
        "driverStats.completedOrders": 1 
      }
    });
    console.log(`💰 Stats updated for driver: ${order.assignedDriver}`);
  }
  // ---------------------------------------

  await order.save();
  res.json({ message: "Updated successfully", status: order.status });
});

// @desc Delete order
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error("Order not found"); }
  
  if (['onDelivery', 'delivered'].includes(order.status)) {
    res.status(400);
    throw new Error("لا يمكن إلغاء الطلب لأنه قيد التوصيل أو تم تسليمه");
  }

  await order.deleteOne();
  res.json({ message: "Order deleted successfully" });
});


const acceptOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) return res.status(404).json({ message: "الطلب غير موجود" });

  // التأكد أن السائق هو الشخص المعين للطلب
  if (order.assignedDriver.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "هذا الطلب لم يتم تعيينه لك" });
  }

  order.status = 'accepted'; // تحويل الحالة من assigned إلى accepted
  await order.save();

  res.json({ message: "تم قبول الطلب بنجاح، يمكنك البدء بالتوصيل" });
});



module.exports = { createOrder, getOrders,getOrderById,getMyHistory, updateOrder, deleteOrder,acceptOrder };


















