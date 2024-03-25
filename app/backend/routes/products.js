const express = require("express");
const router = express.Router(); //used as middleware
const { Product } = require("../models/product");
const mongoose = require("mongoose");

router.get(`/`, async (req, res) => {
  //? query paramter
  let filter = {};
  const productList = await Product.find(filter); //select("name image -_id"); //await requires async
  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id); //await requires async
  if (!product) {
    res.status(500).json({ success: false });
  }
  res.send(product);
});

router.get("/search/:key", async (req, res) => {
  console.log(req.params.key);
  let data = await Product.find({
    $or: [
      {
        name: {
          $regex: new RegExp(req.params.key, "i"),
        },
        /*description: {
          $regex: new RegExp(req.params.key, "i"),
        },*/
      },
    ],
  });
  res.send(data);
});

router.post(`/`, async (req, res) => {
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
});
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid Product Id");
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      brand: req.body.brand,
      price: req.body.price,
      countInStock: req.body.countInStock,
      review:req.body.review
    
    },
    { new: true }
  );
  if (!product) return res.status(500).send("the product cannot be created!");

  res.send(product);
});

router.delete("/:id", (req, res) => {
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "the product is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "product not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

router.get(`/get/count`, async (req, res) => {
  const query = {};
  const productCount = await Product.countDocuments(query);
  console.log("Count:", productCount);
  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

module.exports = router;
