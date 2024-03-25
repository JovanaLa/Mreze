const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router(); //used as middleware
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const userList = await User.find().select("-password"); //await requires async
  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(userList);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found" });
  }
  res.status(200).send(user);
});

router.post("/register", async (req, res) => {
  const users = await User.find({});
  console.log(users);
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    role: req.body.role,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
  if (users.some((user) => user.email === req.body.email)) {
    return res.status(400).json({ error: "Email already exists" });
  }
  user = await user.save();

  if (!user) return res.status(400).send("the user cannot be created!");

  res.send(user);
});
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

router.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = jwt.sign(
      { userId: user.userId, role: user.role, email: user.email },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: accessToken });
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User not found");
    }

    if (bcrypt.compareSync(password, user.password)) {
      const { accessToken, refreshToken } = generateTokens(user);
      res.status(200).send({ user: user.email, accessToken, refreshToken });
    } else {
      res.status(401).send("Incorrect password");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get(`/get/count`, async (req, res) => {
  const query = {};
  const userCount = await User.countDocuments(query);

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({
    userCount: userCount,
  });
});

router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("Invalid user Id");
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
      review: req.body.review
    },
    { new: true }
  );
  if (!user) return res.status(500).send("the user cannot be created!");

  res.send(user);
});

router.delete("/:id", (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found" });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

module.exports = router;
