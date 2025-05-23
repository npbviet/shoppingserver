const express = require("express");
const router = express.Router();
const getDataController = require("../controllers/getData");

// ======================================= PART-1: ROUTERS FOR CLIENT-APP ========================================
// Router for get product data
router.get("/client/get-products", getDataController.getProducts);

// Router for get cart data
router.get("/client/get-carts", getDataController.getCarts);

// Router for get cart data of current user
router.post("/client/get-cart-user", getDataController.getCartOfCurrentUser);

// Router for get order data of current user
router.post("/client/get-order-user", getDataController.getOrderOfCurrentUser);

// Router for get order by orderID
router.post("/client/get-order-by-id", getDataController.getOrderByOrderID);

// ======================================= PART-2: ROUTERS FOR ADMIN-APP ========================================
// Router for get product data
router.get("/admin/get-products", getDataController.getProducts);

// Router for get product by productID
router.post("/admin/get-product-byId", getDataController.getProductById);

// Router for get all users
router.get("/admin/get-users", getDataController.getAllUsers);

// Router for get all orders
router.get("/admin/get-orders", getDataController.getAllOrders);

// Router for get order by orderID
router.post("/admin/get-order-by-id", getDataController.getOrderByOrderID);

// Export to use
module.exports = router;
