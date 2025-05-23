const Product = require("../models/product");
const Cart = require("../models/cart");
const Order = require("../models/order");
const User = require("../models/user");

// Lấy tất cả sản phẩm
exports.getProducts = async (req, res, next) => {
  try {
    const data = await Product.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy sản phẩm theo productID
exports.getProductById = async (req, res, next) => {
  try {
    const { productID } = req.body;
    const data = await Product.findById(productID);
    res.status(200).json(data || null);
  } catch (err) {
    console.error("Lỗi khi lấy sản phẩm theo ID:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy tất cả giỏ hàng
exports.getCarts = async (req, res, next) => {
  try {
    const data = await Cart.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("Lỗi khi lấy giỏ hàng:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy giỏ hàng của người dùng hiện tại
exports.getCartOfCurrentUser = async (req, res, next) => {
  try {
    const { userID } = req.body;
    const data = await Cart.findOne({ userID }).populate("cartData.productId");
    if (!data) return res.status(200).json(null);

    const cartData = data.cartData.map((item) => ({
      productItem: item.productId,
      quantity: item.quantity,
    }));

    res.status(200).json({ userID, cartData });
  } catch (err) {
    console.error("Lỗi khi lấy giỏ hàng người dùng:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy đơn hàng của người dùng hiện tại
exports.getOrderOfCurrentUser = async (req, res, next) => {
  try {
    const { userID } = req.body;
    const data = await Order.find({ "user.userID": userID }).populate(
      "products.productId"
    );
    res.status(200).json(data.length ? data : null);
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng người dùng:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy đơn hàng theo orderID
exports.getOrderByOrderID = async (req, res, next) => {
  try {
    const { orderID } = req.body;
    if (!orderID) return res.status(200).json(null);

    const data = await Order.findById(orderID).populate("products.productId");
    res.status(200).json(data || null);
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng theo ID:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy tất cả người dùng cho trang dashboard quản trị
exports.getAllUsers = async (req, res, next) => {
  try {
    const data = await User.find();
    res.status(200).json(data);
  } catch (err) {
    console.error("Lỗi khi lấy tất cả người dùng:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy tất cả đơn hàng (giao dịch) cho trang dashboard quản trị, sắp xếp theo thời gian cập nhật gần nhất
exports.getAllOrders = async (req, res, next) => {
  try {
    const data = await Order.find().populate("products.productId");
    const sortedData = data.sort((a, b) => b.updatedAt - a.updatedAt);
    res.status(200).json(sortedData);
  } catch (err) {
    console.error("Lỗi khi lấy tất cả đơn hàng:", err);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};
