require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
http.createServer(app);

const port = process.env.PORT || 3000;

//init middleware
app.use(express.json({ extended: false }));
app.use(cors());

app.get("/", (req, res) =>
  res.json({
    message: "Server Running" + ` at port ${port} v 1.0.2`,
  })
);

//define routes
// app.use("/user", require("./routes/user"));

// app.use("/download", require("./routes/download"));

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log("db"))
  .catch((err) => console.log(err))
  .then((result) => {
    app.listen(port);
    console.log(`Connected to PORT ${port} `);
  })
  .catch((err) => {
    console.log(err);
  });
