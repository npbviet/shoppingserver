// Middleware chuyển trường 'productInfor' dạng JSON string trong req.body thành object,
// rồi gộp vào req.body, sau đó xoá trường 'productInfor' gốc
exports.parseToJSON = (req, res, next) => {
  if (req.body && req.body.productInfor) {
    try {
      req.body = {
        ...req.body,
        ...JSON.parse(req.body.productInfor), // chuyển JSON string thành object
      };
      delete req.body.productInfor; // xoá bỏ trường productInfor ban đầu
    } catch (error) {
      // Trả về lỗi nếu JSON không hợp lệ
      return res
        .status(400)
        .json({ error: "Định dạng JSON trong productInfor không hợp lệ" });
    }
  }
  next();
};
