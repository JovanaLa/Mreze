const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { checkTokenBlacklist } = require("../helpers/jwt");
let { blacklist } = require("../controllers/userController");

router.get("/", checkTokenBlacklist, userController.getUsers);
router.get("/:id", checkTokenBlacklist, userController.getUserById);
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/refresh", userController.refresh);
router.put("/:id", checkTokenBlacklist, userController.updateUser);
router.delete("/:id", checkTokenBlacklist, userController.deleteUser);
router.post("/logout", checkTokenBlacklist, userController.logoutUser);

module.exports = router;
