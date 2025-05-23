const Cart = require("../models/cart");
const Order = require("../models/order");
const Product = require("../models/product");
const nodeMailer = require("nodemailer");
const { validationResult } = require("express-validator");
require("dotenv").config();

// Config gửi email qua Gmail SMTP
const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Thêm hoặc cập nhật sản phẩm trong giỏ hàng user
exports.addCart = async (req, res, next) => {
  try {
    const { userID, productID, quantity } = req.body;

    const cart = await Cart.findOne({ userID });

    if (!cart) {
      // Nếu chưa có giỏ hàng, tạo mới
      const newCart = new Cart({
        userID,
        cartData: [{ productId: productID, quantity }],
      });
      await newCart.save();
    } else {
      // Kiểm tra sản phẩm đã có trong giỏ chưa
      const existingProduct = cart.cartData.find(
        (item) => item.productId.toString() === productID
      );

      if (existingProduct) {
        // Tăng số lượng nếu đã có
        existingProduct.quantity += quantity;
      } else {
        // Thêm sản phẩm mới nếu chưa có
        cart.cartData.push({ productId: productID, quantity });
      }

      await cart.save();
    }

    return res.status(201).json({ message: "Thêm vào giỏ hàng thành công!" });
  } catch (error) {
    console.error("Lỗi khi thêm vào giỏ hàng:", error);
    return res.status(500).json({ message: "Thêm vào giỏ hàng thất bại." });
  }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng user
exports.updateCart = async (req, res, next) => {
  try {
    const { userID, productID, quantity } = req.body;

    const updatedCart = await Cart.findOneAndUpdate(
      { userID, "cartData.productId": productID },
      { $set: { "cartData.$.quantity": quantity } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart or product not found." });
    }

    console.log("Cập nhật giỏ hàng thành công!");
    return res
      .status(200)
      .json({ message: "Update cart process is successful!" });
  } catch (error) {
    console.error("Error in updateCart:", error);
    return res.status(500).json({ message: "Failed to update cart." });
  }
};

// Cập nhật số lượng sản phẩm sau khi đặt hàng thành công
exports.updateQuantityOfProducts = async (req, res, next) => {
  try {
    const productArr = req.body.productsInOrder;

    // Dùng Promise.all để thực thi song song các update
    await Promise.all(
      productArr.map((prod) =>
        Product.findByIdAndUpdate(prod.productId, {
          $inc: { count: -prod.quantity },
        })
      )
    );

    console.log("Cập nhật số lượng sản phẩm thành công!");
    return res
      .status(200)
      .json({ message: "Update quantity of products is successful!" });
  } catch (error) {
    console.error("Error in updateQuantityOfProducts:", error);
    return res
      .status(500)
      .json({ message: "Failed to update product quantities." });
  }
};

// Xóa một sản phẩm khỏi giỏ hàng user
exports.deleteItemInCart = async (req, res, next) => {
  try {
    const { userID, productID } = req.body;

    await Cart.updateOne(
      { userID },
      { $pull: { cartData: { productId: productID } } }
    );

    console.log("Xóa phần tử trong giỏ hàng thành công!");
    return res
      .status(200)
      .json({ message: "Delete an item in cart process is successful!" });
  } catch (error) {
    console.error("Error in deleteItemInCart:", error);
    return res.status(500).json({ message: "Failed to delete item in cart." });
  }
};

// Tạo đơn hàng mới và gửi email xác nhận
exports.createOrder = async (req, res, next) => {
  try {
    const { orderInfor, emailContent } = req.body.orderData;

    const order = new Order(orderInfor);
    await order.save();

    // Gửi mail xác nhận đơn hàng
    transporter.sendMail(
      {
        from: `"Shop Support" <${process.env.EMAIL_USER}>`,
        to: orderInfor.user.email,
        subject: "Email confirm your order is successful",
        html: emailContent,
      },
      (error, info) => {
        if (error) {
          console.error("Error sending confirmation email:", error);
        } else {
          console.log("Email sent:", info.response);
        }
      }
    );

    return res
      .status(201)
      .json({ message: "Create order process is successful!" });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({ message: "Failed to create order." });
  }
};

// Xóa toàn bộ giỏ hàng của user
exports.deleteCart = async (req, res, next) => {
  try {
    const { userID } = req.body;

    await Cart.findOneAndDelete({ userID });

    return res
      .status(200)
      .json({ message: "Delete cart process is successful!" });
  } catch (error) {
    console.error("Error in deleteCart:", error);
    return res.status(500).json({ message: "Failed to delete cart." });
  }
};

// Thêm sản phẩm mới kèm upload ảnh
exports.postAddNewProduct = async (req, res, next) => {
  try {
    const imageArr = req.files;
    const { name, category, price, short_desc, long_desc } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: errors.array()[0].msg,
        isErrorValidate: true,
      });
    }

    if (!imageArr || imageArr.length === 0) {
      return res.status(422).json({
        message: "Upload file is not success!",
        isErrorValidate: true,
      });
    }

    const imageObj = {};
    imageArr.forEach((img, index) => {
      imageObj[`img${index + 1}`] = img.path;
    });

    const productData = {
      name,
      category,
      price,
      short_desc,
      long_desc,
      ...imageObj,
    };

    const product = new Product(productData);
    await product.save();

    return res
      .status(201)
      .json({ message: "Add new product process is successful!" });
  } catch (error) {
    console.error("Error in postAddNewProduct:", error);
    return res.status(500).json({ message: "Failed to add new product." });
  }
};

// Sửa thông tin sản phẩm
exports.postEditProduct = async (req, res, next) => {
  try {
    const productInfor = req.body.productInfor;
    const productID = productInfor.productID;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: errors.array()[0].msg,
        isErrorValidate: true,
      });
    }

    await Product.findByIdAndUpdate(
      productID,
      { $set: productInfor },
      { new: true, runValidators: true }
    );

    return res
      .status(200)
      .json({ message: "Edit product process is successful!" });
  } catch (error) {
    console.error("Error in postEditProduct:", error);
    return res.status(500).json({ message: "Failed to edit product." });
  }
};

// Xóa sản phẩm theo ID
exports.postDeleteProduct = async (req, res, next) => {
  try {
    const { productID } = req.body;

    await Product.findByIdAndDelete(productID);

    return res.status(200).json({ message: "Delete product is successful" });
  } catch (error) {
    console.error("Error in postDeleteProduct:", error);
    return res.status(500).json({ message: "Failed to delete product." });
  }
};
