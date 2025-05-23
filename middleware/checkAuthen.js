// Middleware kiểm tra xem người dùng đã đăng nhập chưa
exports.checkAuthen = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    // Nếu chưa đăng nhập, trả về thông báo lỗi
    return res.json({ message: "Not logged in" });
  }
  // Nếu đã đăng nhập, cho phép tiếp tục xử lý request
  next();
};
