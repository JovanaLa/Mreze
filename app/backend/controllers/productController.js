const { Product } = require("../models/product");
const mongoose = require("mongoose");

async function getAllProducts(req, res) {
  try {
    let filter = {};
    const productList = await Product.find(filter);
    if (!productList) {
      res.status(500).json({ success: false });
    }
    res.send(productList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
    }
    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function searchProduct(req, res) {
  try {
    let data = await Product.find({
      $or: [
        {
          name: {
            $regex: new RegExp(req.params.key, "i"),
          },
        },
      ],
    });
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function createProduct(req, res) {
  try {
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      price: req.body.price,
      countInStock: req.body.countInStock,
    });
    product = await product.save();

    if (!product) return res.status(500).send("The product cannot be created");

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function updateProduct(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid Product Id");
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        brand: req.body.brand,
        price: req.body.price,
        countInStock: req.body.countInStock,
        review: req.body.review,
      },
      { new: true }
    );

    if (!product) return res.status(404).send("The product cannot be found!");

    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "The product is deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  searchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
