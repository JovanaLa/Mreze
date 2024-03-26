const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { checkTokenBlacklist } = require("../helpers/jwt");

router.post("/", cartController.addToCart);
router.delete("/:productId", cartController.removeFromCart);
router.get("/", checkTokenBlacklist, cartController.getAllCarts);
router.get("/:id", checkTokenBlacklist, cartController.getCartById);

module.exports = router;
