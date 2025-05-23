const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/auth");
const User = require("../models/user");

// Hàm validate email chung cho cả client và admin
const validateEmail = () =>
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail();

// Hàm validate password cho login (chỉ check không rỗng)
const validatePasswordLogin = () =>
  body("password")
    .notEmpty()
    .withMessage("Enter value to password input please!")
    .trim();

// Hàm validate password cho signup (ít nhất 6 ký tự, alphanumeric)
const validatePasswordSignup = () =>
  body(
    "password",
    "please enter a password with only numbers and text and at least 6 characters"
  )
    .isLength({ min: 6 })
    .isAlphanumeric()
    .trim();

// Hàm validate email không trùng lặp khi signup
const validateEmailUnique = () =>
  body("email").custom((value) => {
    return User.findOne({ email: value }).then((userDoc) => {
      if (userDoc) {
        return Promise.reject("Email exists already!");
      }
    });
  });

// ========== ROUTERS FOR CLIENT ===========

// Check Login
router.get("/client/checklogin", authController.checkLogin);

// Get current user info
router.get("/client/get-current-user", authController.getCurrentUserInfor);

// Login client
router.post(
  "/client/login",
  [validateEmail(), validatePasswordLogin()],
  authController.postLogin
);

// Signup client
router.post(
  "/client/signup",
  [validateEmail(), validateEmailUnique(), validatePasswordSignup()],
  authController.postSignup
);

// Logout client
router.get("/client/logout", authController.getLogout);

// ========== ROUTERS FOR ADMIN ===========

// Get active user info
router.get("/admin/getActiveUserInfor", authController.getCurrentUserInfor);

// Check Login admin
router.get("/admin/checklogin", authController.checkLogin);

// Login admin
router.post(
  "/admin/login",
  [validateEmail(), validatePasswordLogin()],
  authController.postLoginAdmin
);

// Logout admin
router.get("/admin/logout", authController.getLogout);

module.exports = router;
