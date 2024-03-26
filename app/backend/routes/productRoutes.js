const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { checkTokenBlacklist } = require("../helpers/jwt");
let{blacklist} = require("../controllers/userController")
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/search/:key", productController.searchProduct);
router.post("/", checkTokenBlacklist, productController.createProduct);
router.put("/:id", checkTokenBlacklist, productController.updateProduct);
router.delete("/:id", checkTokenBlacklist,  productController.deleteProduct);


module.exports = router;
