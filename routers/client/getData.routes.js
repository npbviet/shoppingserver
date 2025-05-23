const express = require("express");
const router = express.Router();
const getDataController = require("../controllers/getData");

// ======================================= PART-1: ROUTERS FOR CLIENT-APP ========================================
// Router for get product data
router.get("/get-products", getDataController.getProducts);

// Router for get cart data
router.get("/get-carts", getDataController.getCarts);

// Router for get cart data of current user
router.post("/get-cart-user", getDataController.getCartOfCurrentUser);

// Router for get order data of current user
router.post("/get-order-user", getDataController.getOrderOfCurrentUser);

// Router for get order by orderID
router.post("/get-order-by-id", getDataController.getOrderByOrderID);

module.exports = router;
