const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const setDataController = require("../controllers/setData");
const { checkAuthen } = require("../middleware/checkAuthen.js");
const { parseToJSON } = require("../middleware/parseToJSON.js");

// ========================== CLIENT ROUTES ==========================

// Thêm sản phẩm vào giỏ hàng
router.post("/client/add-cart", checkAuthen, setDataController.addCart);

// Cập nhật giỏ hàng
router.post("/client/update-cart", checkAuthen, setDataController.updateCart);

// Xóa 1 sản phẩm khỏi giỏ hàng
router.post(
  "/client/cart/delete-item",
  checkAuthen,
  setDataController.deleteItemInCart
);

// Xóa toàn bộ giỏ hàng
router.post("/client/delete-cart", checkAuthen, setDataController.deleteCart);

// Tạo đơn hàng mới
router.post("/client/create-order", checkAuthen, setDataController.createOrder);

// Cập nhật số lượng sản phẩm sau khi đặt hàng
router.post(
  "/client/product/update-quantity",
  checkAuthen,
  setDataController.updateQuantityOfProducts
);

// ========================== ADMIN ROUTES ==========================

// Thêm sản phẩm mới
router.post(
  "/admin/product/add",
  checkAuthen,
  parseToJSON,
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters.")
      .trim(),
    body("category")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Category must be at least 3 characters.")
      .trim(),
    body("price").isFloat().withMessage("Price must be a valid number."),
    body("short_desc")
      .isLength({ min: 5, max: 200 })
      .withMessage("Short description must be 5–200 characters.")
      .trim(),
    body("long_desc")
      .isLength({ min: 5, max: 600 })
      .withMessage("Long description must be 5–600 characters.")
      .trim(),
  ],
  setDataController.postAddNewProduct
);

// Sửa sản phẩm
router.post(
  "/admin/product/edit",
  checkAuthen,
  [
    body("productInfor.name")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters.")
      .trim(),
    body("productInfor.category")
      .isString()
      .isLength({ min: 3 })
      .withMessage("Category must be at least 3 characters.")
      .trim(),
    body("productInfor.price")
      .isFloat()
      .withMessage("Price must be a valid number."),
    body("productInfor.short_desc")
      .isLength({ min: 5, max: 200 })
      .withMessage("Short description must be 5–200 characters.")
      .trim(),
    body("productInfor.long_desc")
      .isLength({ min: 5, max: 600 })
      .withMessage("Long description must be 5–600 characters.")
      .trim(),
  ],
  setDataController.postEditProduct
);

// Xóa sản phẩm
router.post(
  "/admin/product/delete",
  checkAuthen,
  setDataController.postDeleteProduct
);

module.exports = router;
