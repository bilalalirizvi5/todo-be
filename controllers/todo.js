const jwt = require("jsonwebtoken");
const Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { todo, description, status, dueDate } = req.body;
    if (!todo?.trim() || !description.trim() || !status || !dueDate) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const newTodo = new Todo({
      todo,
      description,
      status,
      dueDate,
      userId: decodedToken.userId,
    });
    await newTodo.save();
    return res.status(200).json({
      message: "Todo created successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

exports.getTodo = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { status, page } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const query = { userId: decodedToken.userId };
    if (status && status !== "All Todo") {
      query.status = status;
    }
    const [todos, totalCount] = await Promise.all([
      Todo.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Todo.countDocuments(query),
    ]);

    return res.status(200).json({
      total: totalCount,
      todos,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

exports.updateTodo = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { id } = req.params;
  const { todo, description, status, dueDate } = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const _todo = await Todo.findOne({ _id: id, userId: decodedToken.userId });

    if (!_todo) {
      return res
        .status(404)
        .json({ message: "Todo not found or unauthorized access" });
    }

    // Update fields if provided
    if (todo !== undefined) {
      _todo.todo = todo;
    }
    if (description !== undefined) {
      _todo.description = description;
    }
    if (status !== undefined) {
      _todo.status = status;
    }
    if (dueDate !== undefined) {
      _todo.dueDate = dueDate;
    }

    await _todo.save();

    return res.status(200).json({ message: "Todo updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

exports.deleteTodo = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const todoId = req.params.id;

    // Find the todo by ID and check if it belongs to the logged-in user
    const todo = await Todo.findOne({
      _id: todoId,
      userId: decodedToken.userId,
    });

    // If the todo doesn't exist or doesn't belong to the user, return an error
    if (!todo) {
      return res
        .status(404)
        .json({ message: "Todo not found or unauthorized access" });
    }

    // Delete the todo
    await Todo.deleteOne({ _id: todoId });

    return res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
