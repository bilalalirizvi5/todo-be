const express = require("express");

const todoController = require("../controllers/todo");

const router = express.Router();

router.post("/create", todoController.createTodo);
router.get("/get", todoController.getTodo);
router.put("/update/:id", todoController.updateTodo);
router.delete("/delete/:id", todoController.deleteTodo);

module.exports = router;
