const { Cart } = require("../models/cart");
const jwt = require("jsonwebtoken");

async function addToCart(req, res) {
  let userId;
  if (!req.headers.authorization) {
    userId = req.body.userId;
  } else {
    let token = req.headers.authorization.split(" ")[1];
    token = jwt.verify(token, process.env.access_secret);

    userId = token.userId;
  }

  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({
      userId,
      items: [
        {
          productId: req.body.productId,
          quantity: isValidNumber(req.body.quantity)
            ? parseInt(req.body.quantity)
            : 1,
        },
      ],
    });
  } else {
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId && item.productId.toString() === req.body.productId
    );

    if (existingItemIndex !== -1) {
      const quantityToAdd = isValidNumber(req.body.quantity)
        ? parseInt(req.body.quantity)
        : 1;
      cart.items[existingItemIndex].quantity += quantityToAdd;
    } else {
      const quantity = isValidNumber(req.body.quantity)
        ? parseInt(req.body.quantity)
        : 1;
      cart.items.push({
        productId: req.body.productId,
        quantity: quantity,
      });
    }
  }
  console.log(userId);

  cart = await cart.save();

  if (!cart) {
    return res.status(500).send("The cart cannot be created");
  }

  res.status(200).send(cart);
}

async function removeFromCart(req, res) {
  let userId;
  if (!req.headers.authorization) {
    userId = req.body.userId;
  } else {
    let token = req.headers.authorization.split(" ")[1];
    token = jwt.verify(token, process.env.access_secret);

    userId = token.userId;
  }

  const productId = req.params.productId;

  let cart = await Cart.findOne({ userId });
  console.log(cart);
  if (!cart) {
    return res.status(404).send("Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) =>
      item.productId && item.productId.toString() === req.params.productId
  );
  if (itemIndex !== -1) {
    cart.items.splice(itemIndex, 1);
  } else {
    return res.status(404).send("Item not found in cart");
  }

  cart = await cart.save();

  if (!cart) {
    return res.status(500).send("The cart cannot be updated");
  }

  res.send(cart);
}

async function getAllCarts(req, res) {
  const cartList = await Cart.find();

  if (!cartList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(cartList);
}

async function getCartById(req, res) {
  const cart = await Cart.findById(req.params.id).select("-password");

  if (!cart) {
    res
      .status(500)
      .json({ message: "The cart with the given ID was not found" });
  }
  res.status(200).send(cart);
}

function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

module.exports = {
  addToCart,
  removeFromCart,
  getAllCarts,
  getCartById,
};
