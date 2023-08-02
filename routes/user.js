const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/create", userController.createUser);
router.post("/login", userController.login);
router.put("/update", userController.updateUser);

module.exports = router;
