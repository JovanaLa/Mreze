const { Order } = require("../models/order");
const express = require("express");
const { Cart } = require("../models/cart");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Product } = require("../models/product");

router.get(`/`, async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'User is not logged in' });
  }
  token = token.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.access_secret);
  const userRole = decodedToken.role;

  let userOrderList;

  if (userRole === "admin") {
    userOrderList = await Order.find({})
      .populate("cart", "product")
      .sort({ dateOrdered: -1 });
  } else {
    userOrderList = await Order.find({ user: decodedToken.userId })
      .populate("cart", "product")
      .sort({ dateOrdered: -1 });
  }

  if (!userOrderList) {
    return res.status(404).json({ success: false, message: "No orders found" });
  }

  res.status(200).json({ success: true, orders: userOrderList });
});
router.get(`/:id`, async (req, res) => { const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'User is not logged in' });
    }
    token = token.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.access_secret);
  const userRole = decodedToken.role;

  let userOrderList;

  if (userRole === "admin") {
    userOrderList = await Order.find({})
      .populate("cart", "product")
      .sort({ dateOrdered: -1 });
  } else {
    userOrderList = await Order.find({ user: decodedToken.userId })
      .populate("cart", "product")
      .sort({ dateOrdered: -1 });
  }

  if (!userOrderList) {
    return res.status(404).json({ success: false, message: "No orders found" });
  }

  res.status(200).json({ success: true, orders: userOrderList });
});

router.post("/", async (req, res) => {
  try {
    const cart = await Cart.findById(req.body.cart).populate("items");
    const totalPrices = [];
    console.log("Cart:", cart);
    console.log("Cart items:", cart.items);

    for (const cartItem of cart.items) {
      let product = await Product.findById(cartItem.productId);
      console.log(cartItem.productId);
      console.log(product);
      const totalPrice = product.price * cartItem.quantity;
      totalPrices.push(totalPrice);
    }

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
      cart: req.body.cart,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });

    order = await order.save();

    if (!order) {
      return res.status(400).send("The order could not be created");
    }

    res.send(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
router.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order) return res.status(400).send("the order cannot be update!");

  res.send(order);
});

router.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.carts.map(async (cart) => {
          await cart.findByIdAndRemove(cart);
        });
        return res
          .status(200)
          .json({ success: true, message: "the order is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "order not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

module.exports = router;
