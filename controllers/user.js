const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// const randomCode = () => {
//   return Math.random().toString(36).substr(2, 8).toUpperCase();
// };

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
              email,
              userName,
              password: hashedPassword,
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

exports.login = (req, res, next) => {
  console.log("=========>", req.body);
  const email = req.body.email?.toLowerCase();
  const password = req.body.password;
  let loadedUser = "";

  User.findOne({ email })
    .then(async (res) => {
      console.log("res", res);
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

// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find({ type: "user" });
//     if (users) {
//       res.status(200).json(users);
//     }
//   } catch (err) {
//     res.status(500).json({
//       message: err.toString()
//     });
//   }
// };

// exports.editUser = async (req, res) => {
//   try {
//     const { userName, phone, permissions, userStatus, role } = req.body;
//     const _id = req.params.id;
//     User.findOneAndUpdate(
//       { _id: _id },
//       {
//         $set: {
//           userName: userName,
//           phone: phone,
//           status: userStatus,
//           role: role,
//           permissions: permissions
//         }
//       },
//       { new: true },
//       (err, data) => {
//         if (data) {
//           res.status(200).json({
//             message: "user updated scessfully"
//           });
//         } else {
//           res.status(500).json({
//             message: "not updated"
//           });
//         }
//       }
//     );
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json(err);
//   }
// };

// exports.deleteUser = async (req, res) => {
//   try {
//     User.deleteOne({ _id: req.params.id }).then(() => {
//       res.status(200).json({
//         message: "User Delete Successfully"
//       });
//     });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json(err);
//   }
// };

// exports.forgetPassword = (req, res, next) => {
//   const email = req.body.email.toLowerCase();
//   let code;
//   User.findOne({ email })
//     .then(async (user) => {
//       if (user) {
//         code = user?.passwordRecoveryToken || randomCode();
//         user.passwordRecoveryToken = randomCode();
//         user.recoveryCode = code;
//         user.save();
//         await sendMail(req.body.email, code);
//         return res.status(200).json({
//           message: "Recovery Token has been sent to your email.",
//           code
//         });
//       } else {
//         const error = new Error("No User found by this email");
//         error.statusCode = 401;
//         throw error;
//       }
//     })
//     .catch((err) => {
//       console.log(err);
//       if (err.statusCode === 401) {
//         res.status(401).json({
//           message: "No User found by this email"
//         });
//       } else if (err.statusCode === 400) {
//         res.status(400).json({
//           message: "Invalid Password"
//         });
//       } else {
//         res.status(500).json({
//           message: "Internal Server Error"
//         });
//       }
//     });
// };

// exports.updatePassword = (req, res) => {
//   const { email, newPassword, confirmPassword } = req.body;
//   User.findOne({ email })
//     .then(async (user) => {
//       if (user) {
//         if (newPassword !== confirmPassword) {
//           return res.status(400).json({
//             message: "New Password Did not Match Confirm Password"
//           });
//         } else {
//           if (newPassword.length >= 8) {
//             bcrypt.hash(newPassword, 12).then((hashedPassword) => {
//               let payload = {
//                 password: hashedPassword
//               };
//               User.findOneAndUpdate({ email }, payload)
//                 .then(() => {
//                   return res.status(200).json({
//                     message: "Password Changed Successfully"
//                   });
//                 })
//                 .catch((err) => {
//                   console.log(err);
//                   return res.status(500).json({
//                     message: "Error Password Changing",
//                     err
//                   });
//                 });
//             });
//           } else {
//             return res.status(400).json({
//               message: "Password must be greater than or equal to 8 characters"
//             });
//           }
//         }
//       } else {
//         return res.status(500).json({
//           message: "No User/Admin found by this Email"
//         });
//       }
//     })
//     .catch((err) => {
//       console.log("err", err);
//       res.status(500).json({
//         message: "Internal Server Error"
//       });
//     });
// };

// exports.verifyCode = (req, res, next) => {
//   try {
//     const code = req.body.code?.toUpperCase();
//     const email = req.body.email.toLowerCase();

//     User.findOne({ email })
//       .then(async (user) => {
//         if (user.recoveryCode === code) {
//           return res.status(200).json({
//             message: "Code Verified"
//           });
//         } else {
//           return res.status(400).json({
//             message: "Invalid Code"
//           });
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//         if (err.statusCode === 401) {
//           res.status(401).json({
//             message: "No User/Admin found by this email"
//           });
//         } else if (err.statusCode === 400) {
//           res.status(400).json({
//             message: "Invalid Password"
//           });
//         } else {
//           res.status(500).json({
//             message: "Internal Server Error"
//           });
//         }
//       });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json(err);
//   }
// };

// const sendMail = async (email, token) => {
//   const transport = createTransport(
//     sendgridTransport({
//       auth: {
//         api_key: process.env.NODEMAILER_API_KEY
//       }
//     })
//   );
//   await transport.sendMail({
//     from: "info@rmstechknowledgy.com",
//     to: email,
//     subject: "IAMS Password Recovery",
//     text: `Your password recovery token is ${token}`
//   });
// };
