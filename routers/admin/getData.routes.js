const express = require("express");
const router = express.Router();
const getDataController = require("../../controllers/getData");

// ======================================= PART-2: ROUTERS FOR ADMIN-APP ========================================
// Router for get product data
router.get("/get-products", getDataController.getProducts);

// Router for get product by productID
router.post("/get-product-byId", getDataController.getProductById);

// Router for get all users
router.get("/get-users", getDataController.getAllUsers);

// Router for get all orders
router.get("/get-orders", getDataController.getAllOrders);

// Router for get order by orderID
router.post("/get-order-by-id", getDataController.getOrderByOrderID);

// Export to use
module.exports = router;
