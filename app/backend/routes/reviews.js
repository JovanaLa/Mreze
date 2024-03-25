const express = require("express");
const router = express.Router();
const { Product } = require("../models/product");
const { Review } = require("../models/review");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const reviewData = {
      userId: req.body.userId,
      productId: req.body.productId,
      grade: req.body.grade,
      comment: req.body.comment,
    };
    const review = await Review.create(reviewData);
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { review: review._id },
    });
    await Product.findByIdAndUpdate(req.body.productId, {
      $push: { review: review._id },
    });
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/product/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    console.log(product);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const reviews = await Review.find({ productId: req.params.productId });
    console.log(product);
    console.log(reviews);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "User is not logged in" });
  }
  token = token.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.access_secret);
  const userRole = decodedToken.role;

  let userreviewList;

  if (userRole === "admin") {
    userreviewList = await Review.find({}).sort({ datereviewed: -1 });
  } else {
    userreviewList = await Review.find({ userId: decodedToken.userId }).sort({
      datereviewed: -1,
    });
  }

  console.log("User Role:", userRole);
  console.log("User ID:", decodedToken.userId);
  console.log("Number of Reviews:", userreviewList.length);

  if (!userreviewList.length) {
    return res
      .status(404)
      .json({ success: false, message: "No reviews found" });
  }

  res.status(200).json({ success: true, reviews: userreviewList });
});

module.exports = router;
