const express = require("express");
const router = express.Router();
const { Cart } = require("../models/cart");

router.post("/", async (req, res) => {
  let cart = await Cart.findOne({ userId: req.body.userId });

  if (!cart) {
    cart = new Cart({
      userId: req.body.userId,
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

  cart = await cart.save();

  if (!cart) {
    return res.status(500).send("The cart cannot be created");
  }

  res.status(200).send(cart);
});

function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

router.delete("/:userId/:productId", async (req, res) => {
  const { userId, product } = req.params;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    return res.status(404).send("Cart not found");
  }

  const itemIndex = cart.items.findIndex((item) => item.product === product);
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
});
router.get("/", async (req, res) => {
  const cartList = await Cart.find(); //await requires async
  if (!cartList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(cartList);
});

router.get("/:id", async (req, res) => {
  const cart = await Cart.findById(req.params.id).select("-password");

  if (!cart) {
    res
      .status(500)
      .json({ message: "The cart with the given ID was not found" });
  }
  res.status(200).send(cart);
});

module.exports = router;
