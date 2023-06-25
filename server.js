require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
http.createServer(app);

const PORT = process.env.PORT || 3000;

//init middleware
app.use(express.json({ extended: false }));
app.use(cors());

app.get("/", (req, res) =>
  res.json({
    message: "Server Running" + ` at port ${PORT} v 1.0.0`,
  })
);

//define routes
app.use("/user", require("./routes/user"));

app.listen(PORT, () => {
  console.log(`Server is Connected with port ${PORT}`);
});

// START DATABASE
(async () => {
  try {
    const DB_NAME = encodeURIComponent(process.env.NAME);
    const DB_PASS = encodeURIComponent(process.env.PASSWORD);
    const DB_CLUSTER = process.env.CLUSTER;
    const DB = process.env.DB;
    const databaseURI = `mongodb+srv://${DB_NAME}:${DB_PASS}@${DB_CLUSTER}/${DB}?retryWrites=true&w=majority`;
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(databaseURI, options);
    console.log("Database Connected");
  } catch ({ message }) {
    console.log("Database Connection Error:", message);
  }
})();
