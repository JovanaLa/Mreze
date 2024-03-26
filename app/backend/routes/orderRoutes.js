const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { checkTokenBlacklist } = require("../helpers/jwt");

router.get("/", checkTokenBlacklist,orderController.getAllOrders);
router.get("/:id", checkTokenBlacklist, orderController.getOrderById);
router.post("/", orderController.createOrder);
router.put("/:id", checkTokenBlacklist, orderController.updateOrder);
router.delete("/:id", checkTokenBlacklist, orderController.deleteOrder);

module.exports = router;
