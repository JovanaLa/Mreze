const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { checkTokenBlacklist } = require("../helpers/jwt");
let { blacklist } = require("../controllers/userController");

router.post("/", reviewController.createReview);
router.get(
  "/product/:productId",
  checkTokenBlacklist,
  reviewController.getReviewsByProduct
);
router.get("/user", checkTokenBlacklist, reviewController.getReviewsByUser);

module.exports = router;
