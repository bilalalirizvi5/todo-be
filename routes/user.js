const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post("/create", userController.createUser);
router.post("/login", userController.login);

// // Reset Password Routes
// router.post("/forget-password", userController.forgetPassword);
// router.post("/update-password", userController.updatePassword);
// router.post("/verify-code", userController.verifyCode);

// router.get("/get",userController.getAllUsers);
// router.post("/edit/:id", userController.editUser);
// router.get("/delete/:id", userController.deleteUser);

module.exports = router;
