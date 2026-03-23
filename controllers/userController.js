const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const sendEmail = require("../Utils/sendMailer");
const {
  generateToken,
  generateRefreshToken,
} = require("../Utils/generateToken");


const validateEmail = (email) => {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
};

const validatePassword = (password) =>
  password && password.length >= 7;





// @desc Get all users
// @route GET /api/users
// @access Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
});

// @desc    Register a new user (By Admin)
// @route   POST /api/users/register
// @access  Private/Admin
const registerUser = asyncHandler(async (req, res) => {
  // 1. استلام البيانات من الطلب (بما فيها الـ role والـ phone)
  const { name, email, password, role, phone } = req.body;

  // 2. التحقق من وجود الحقول الأساسية
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // 3. التحقق من صيغة الإيميل (باستخدام الدوال الموجودة لديك)
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // 4. التحقق من قوة كلمة المرور
  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 7 characters" });
  }

  // 5. التحقق مما إذا كان المستخدم موجوداً مسبقاً
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // 6. تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(password, 10);

  // 7. إنشاء المستخدم في قاعدة البيانات
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone: phone || "", // حفظ رقم الهاتف إذا أُرسل من الفرونت إند
    role: role || 'driver' // هنا يتم تحديد الرتبة، وإذا لم ترسل نضع driver كافتراضي
  });

  // 8. إرجاع الاستجابة بنجاح
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // إرجاع الرتبة للتأكيد في الفرونت إند
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
});




// @desc Login user
// @route POST /api/users/login
// @access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password)
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // تخزين Refresh Token في HTTP-only Cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
    sameSite: "lax",
  });

  // إرسال Access Token وبيانات المستخدم
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: accessToken,
  });
});






 


const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  // المستخدم يعدل نفسه فقط — إلا إذا كان admin
  if (
    user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const { name, email, password, role } = req.body;

  if (email && !validateEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password && !validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 7 characters" });
  }

  user.name = name || user.name;
  user.email = email || user.email;

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  // 🔐 تغيير الرول للأدمن فقط
  if (role && req.user.role === "admin") {
    user.role = role;
  }

  const updatedUser = await user.save();

  res.status(200).json(updatedUser);
});


// @desc Get all drivers
// @route GET /api/users/drivers
// @access Private (Admin only)
const getDrivers = asyncHandler(async (req, res) => {
  // البحث عن المستخدمين الذين يمتلكون رول driver
  const drivers = await User.find({ role: "driver" }).select("name email phone _id");
  res.status(200).json(drivers);
});



// @desc Delete user
// @route DELETE /api/users/:id
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (user._id.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: "Not authorized" });
  }

  await user.deleteOne();
  res.status(200).json({ message: "User deleted successfully" });
});

// @desc Student requests to assign a coach
// @route PUT /api/users/:studentId/request-coach
// @access Private (Student only)
const requestCoach = asyncHandler(async (req, res) => {
  const { coachId } = req.body;

  if (req.user.role !== "student") {
    res.status(403);
    throw new Error("Only students can request a coach");
  }

  const coach = await User.findById(coachId);
  if (!coach || coach.role !== "coach") {
    res.status(404);
    throw new Error("Coach not found");
  }

  // إضافة الطالب إلى قائمة الانتظار للكوتش (pendingStudents)
  coach.pendingStudents = coach.pendingStudents || [];
  if (!coach.pendingStudents.includes(req.user._id)) {
    coach.pendingStudents.push(req.user._id);
    await coach.save();
  }

  res.status(200).json({ message: "Coach request sent" });
});



// @desc Coach approves or rejects a student request
// @route PUT /api/users/:studentId/approve-student
// @access Private (Coach only)
const approveStudent = asyncHandler(async (req, res) => {
  const { approve } = req.body;
  const student = await User.findById(req.params.studentId);

  if (!student || student.role !== "student") {
    res.status(404);
    throw new Error("Student not found");
  }

  // تحقق أن الطالب موجود في قائمة الانتظار (pendingStudents) للكوتش
  if (!req.user.pendingStudents.includes(student._id)) {
    res.status(400);
    throw new Error("Student did not request you");
  }

  // إزالة الطالب من قائمة الانتظار
  req.user.pendingStudents = req.user.pendingStudents.filter(
    s => s.toString() !== student._id.toString()
  );

  if (approve) {
    student.coach = req.user._id;
    await student.save();

    // إضافة الطالب فقط إذا لم يكن موجودًا
    if (!req.user.students.includes(student._id)) {
        req.user.students.push(student._id);
    }
}

  await req.user.save();

  res.json({ message: approve ? "Student approved" : "Student rejected" });
});




// @desc Get current user
// @route GET /api/users/me
// @access Private
// GET /api/user/me
const getMe = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    res.json(user);
  } catch {
    return res.status(401).json({ message: "Token expired" });
  }
});




// @desc Send reset code
// @route POST /api/users/sendcode
// @access Public
const sendCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "Email not found" });

  await sendEmail(email);
  res.status(200).json({ message: "Code sent to email" });
});

// @desc Confirm code
// @route POST /api/users/confirmcode
// @access Public
const confirmCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  if (user.code !== code) {
    return res.status(400).json({ message: "Invalid code" });
  }

  res.status(200).json({ message: "Code verified" });
});

// @desc Reset password
// @route POST /api/users/newpassword
// @access Public
const newPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ message: "Password must be at least 7 characters" });
  }

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found" });

  user.password = await bcrypt.hash(password, 10);
  await user.save();

  res.status(200).json({ message: "Password updated successfully" });
});



// @desc Refresh access token
// @route POST /api/users/refresh
// @access Public
const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    // 🔹 جلب المستخدم
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔹 إنشاء Access Token جديد
    const accessToken = generateToken(user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessToken, // اختياري (لو حاب تستخدمه)
    });

  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
});



const logoutUser = (req, res) => {
  // مسح الـ refreshToken من الكوكيز
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  getUsers,
  registerUser,
  loginUser,
  updateUser,
  getDrivers,
  deleteUser,
  requestCoach,
  approveStudent,
  getMe,
  sendCode,
  confirmCode,
  newPassword,
  refreshToken,
  logoutUser,
  
};
