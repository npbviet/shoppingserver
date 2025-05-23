const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const setDataController = require("../../controllers/setData");
const { checkAuthen } = require("../../middleware/checkAuthen.js");
const { parseToJSON } = require("../../middleware/parseToJSON.js");

// ========================== ADMIN ROUTES ==========================

// Thêm sản phẩm mới
router.post(
  "/product/add",
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
  "/product/edit",
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
  "/product/delete",
  checkAuthen,
  setDataController.postDeleteProduct
);

module.exports = router;
