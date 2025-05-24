const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/user");

// Hàm helper lấy ra thông tin cần thiết của user để trả về client
const getUserInfo = (user) => ({
  userID: user._id,
  userEmail: user.email,
  fullName: user.fullName,
  lastName: user.fullName.split(" ").at(-1),
  phone: user.phone,
  role: user.role,
});

// ================= PART-1: ACTIONS CHO CLIENT-APP =================

// Kiểm tra trạng thái đăng nhập của user (dựa vào session)
exports.checkLogin = (req, res) => {
  res.json({ isLoggedIn: req.session.isLoggedIn || false });
};

// Xử lý đăng nhập user
exports.postLogin = async (req, res) => {
  try {
    // Kiểm tra lỗi validate input (email, password)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ message: errors.array()[0].msg, isAuthError: true });
    }

    const { email, password } = req.body;

    // Tìm user theo email trong CSDL
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng", isAuthError: true });
    }

    // So sánh mật khẩu nhập với mật khẩu đã hash trong CSDL
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng", isAuthError: true });
    }

    // Nếu đúng, tạo session lưu trạng thái đăng nhập và thông tin user
    req.session.isLoggedIn = true;
    req.session.user = {
      userID: user._id,
      userEmail: user.email,
      fullName: user.fullName,
      lastName: user.fullName.split(" ").at(-1),
      phone: user.phone,
      role: user.role,
    };
    // await req.session.save(); // Lưu session

    // Trả về thông báo đăng nhập thành công kèm thông tin user
    res.json({
      message: "Đăng nhập thành công",
      isAuthError: false,
      ...getUserInfo(user),
      isLoggedIn: true,
      sessionInfo: JSON.stringify(req.session.user),
    });
  } catch (err) {
    console.error("Lỗi khi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Xử lý đăng ký user mới
exports.postSignup = async (req, res) => {
  try {
    // Kiểm tra lỗi validate input (fullName, email, password, phone)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.",
        isAuthError: true,
        errors: errors.array(),
      });
    }

    const { fullName, email, password, phone } = req.body;

    // Mã hóa mật khẩu bằng bcrypt với saltRounds=12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo mới user và lưu vào CSDL
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });
    await newUser.save();

    // Trả về thông báo đăng ký thành công
    res.json({ message: "Đăng ký thành công", isAuthError: false });
  } catch (err) {
    console.error("Lỗi khi đăng ký:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Xử lý đăng xuất (destroy session)
exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Lỗi khi logout:", err);
      return res.status(500).json({ message: "Lỗi khi đăng xuất" });
    }
    // Trả về thông báo đăng xuất thành công
    res.json({ message: "Đăng xuất thành công" });
  });
};

// Lấy thông tin user hiện tại từ session
exports.getCurrentUserInfor = (req, res) => {
  console.log(req.session);
  // if (!req.session?.isLoggedIn || !req.session.user) {
  //   // loi dang roi vaocase naynay
  //   return res.status(401).json({
  //     message: "Chưa đăng nhập",
  //     isLoggedIn: JSON.stringify(req.session.user),
  //   });
  // }
  // Trả về thông tin user và trạng thái đăng nhập
  res.json({ ...getUserInfo(req.session.user), isLoggedIn: true });
};

// ================= PART-2: ACTIONS CHO ADMIN-APP =================

// Xử lý đăng nhập cho admin (có phân quyền)
exports.postLoginAdmin = async (req, res) => {
  try {
    // Kiểm tra lỗi validate input (email, password)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ message: errors.array()[0].msg, isAuthError: true });
    }

    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Người dùng không tồn tại", isAuthError: true });
    }

    // So sánh mật khẩu
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng", isAuthError: true });
    }

    // Kiểm tra quyền truy cập admin
    if (user.role === "customer") {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập trang quản trị",
        isAuthError: true,
      });
    }

    // Tạo session lưu trạng thái đăng nhập admin
    req.session.isLoggedIn = true;
    req.session.user = user;
    await req.session.save();

    // Trả về thông báo đăng nhập thành công
    res.json({ message: "Đăng nhập quản trị thành công", isAuthError: false });
  } catch (err) {
    console.error("Lỗi khi đăng nhập admin:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
