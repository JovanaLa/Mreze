const { Order } = require("../models/order");
const { Cart } = require("../models/cart");
const { Product } = require("../models/product");
const jwt = require("jsonwebtoken");

async function getAllOrders(req, res) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: "User is not logged in" });
    }
    const decodedToken = jwt.verify(
      token.split(" ")[1],
      process.env.access_secret
    );
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
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }

    res.status(200).json({ success: true, orders: userOrderList });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function getOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id).populate(
      "cart",
      "product"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function createOrder(req, res) {
  try {
    const cart = await Cart.findById(req.body.cart).populate("items");
    const totalPrices = [];

    for (const cartItem of cart.items) {
      let product = await Product.findById(cartItem.productId);
      const totalPrice = product.price * cartItem.quantity;
      totalPrices.push(totalPrice);
    }

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);
    let userId;
    if (!req.headers.authorization) {
      userId = req.body.userId;
    } else {
      let token = req.headers.authorization.split(" ")[1];
      token = jwt.verify(token, process.env.access_secret);

      userId = token.userId;
    }
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
      user: userId,
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
}

async function updateOrder(req, res) {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true }
    );

    if (!order) return res.status(400).send("The order cannot be updated!");

    res.send(order);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

async function deleteOrder(req, res) {
  try {
    const order = await Order.findByIdAndRemove(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    await Promise.all(
      order.cart.map(async (cart) => {
        await Cart.findByIdAndRemove(cart);
      })
    );

    res.status(200).json({ success: true, message: "The order is deleted!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
