const express = require("express");
const router = express.Router();

const setDataController = require("../controllers/setData");
const { checkAuthen } = require("../middleware/checkAuthen.js");

// ========================== CLIENT ROUTES ==========================

// Thêm sản phẩm vào giỏ hàng
router.post("/add-cart", checkAuthen, setDataController.addCart);

// Cập nhật giỏ hàng
router.post("/update-cart", checkAuthen, setDataController.updateCart);

// Xóa 1 sản phẩm khỏi giỏ hàng
router.post(
  "/cart/delete-item",
  checkAuthen,
  setDataController.deleteItemInCart
);

// Xóa toàn bộ giỏ hàng
router.post("/delete-cart", checkAuthen, setDataController.deleteCart);

// Tạo đơn hàng mới
router.post("/create-order", checkAuthen, setDataController.createOrder);

// Cập nhật số lượng sản phẩm sau khi đặt hàng
router.post(
  "/product/update-quantity",
  checkAuthen,
  setDataController.updateQuantityOfProducts
);

module.exports = router;
