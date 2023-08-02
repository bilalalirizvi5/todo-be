const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const randomCode = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

exports.createUser = (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const { password, userName } = req.body;

    User.findOne({ email }).then(async (doc) => {
      if (doc) {
        return res.status(400).json({
          message: "User with same email is already registered!",
        });
      } else {
        if (password.length >= 8) {
          bcrypt.hash(password, 12).then((hashedPassword) => {
            let payload = {
              userName,
              email,
              password: hashedPassword,
              passwordRecoveryToken: randomCode(),
            };
            User.create(payload)
              .then(() => {
                return res.status(200).json({
                  message: "User Registered Succesfully",
                });
              })
              .catch((err) => {
                console.log(err);
                return res.status(500).json({
                  message: "Error Registering User",
                  err,
                });
              });
          });
        } else {
          return res.status(400).json({
            message: "Password must be greater than or equal to 8 characters",
          });
        }
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

exports.login = (req, res) => {
  const email = req.body.email?.toLowerCase();
  const password = req.body.password;
  let loadedUser = "";

  User.findOne({ email })
    .then(async (res) => {
      if (res) {
        loadedUser = res;
        return bcrypt.compare(password, res.password);
      } else {
        const error = new Error("No User found by this email");
        error.statusCode = 401;
        throw error;
      }
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Invalid Password");
        error.statusCode = 400;
        throw error;
      }

      const token = jwt.sign(
        {
          userId: loadedUser._id,
        },
        process.env.JWT_SECRET
      );

      res.status(200).json({
        message: "Logged In Succesfully",
        token: token,
        user: loadedUser,
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.statusCode === 401) {
        res.status(401).json({
          message: "No User found by this email",
        });
      } else if (err.statusCode === 400) {
        res.status(400).json({
          message: "Invalid Password",
        });
      } else {
        res.status(500).json({
          message: "Internal Server Error",
        });
      }
    });
};

exports.updateUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const { email, password, userName, photoUrl } = req.body;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decodedToken.userId });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found or unauthorized access" });
    }

    if (email !== undefined) {
      user.email = email;
    }
    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }
    if (userName !== undefined) {
      user.userName = userName;
    }
    if (photoUrl !== undefined) {
      user.photoUrl = photoUrl;
    }

    await user.save();
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
