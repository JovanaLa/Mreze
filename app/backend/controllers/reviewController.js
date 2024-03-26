const { Product } = require("../models/product");
const { Review } = require("../models/review");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

async function createReview(req, res) {
  try {
    const product = await Product.findById(req.body.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    let userId;
    if (!req.headers.authorization) {
      userId = req.body.userId;
    } else {
      let token = req.headers.authorization.split(" ")[1];
      token = jwt.verify(token, process.env.access_secret);

      userId = token.userId;
    }
    const reviewData = {
      userId: userId,
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
}

async function getReviewsByProduct(req, res) {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "name",
      "description",
      "price"
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const reviews = await Review.find({ productId: req.params.productId });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getReviewsByUser(req, res) {
  try {
    let token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "User is not logged in" });
    }
    token = token.split(" ")[1];
    token = jwt.verify(token, process.env.access_secret);
    const userRole = token.role;

    let userReviewList;

    if (userRole === "admin") {
      userReviewList = await Review.find({}).sort({ datereviewed: -1 });
    } else {
      userReviewList = await Review.find({ userId: token.userId }).sort({
        datereviewed: -1,
      });
    }

    if (!userReviewList.length) {
      return res
        .status(404)
        .json({ success: false, message: "No reviews found" });
    }

    res.status(200).json({ success: true, reviews: userReviewList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createReview,
  getReviewsByProduct,
  getReviewsByUser,
};
