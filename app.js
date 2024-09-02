const express = require("express");
const winston = require("winston");
const app = express();
const cors = require("cors");
const logger = winston.createLogger();
const bp = require("body-parser");
const userRouter = require("./routes/userRouter");

app.use(cors());
app.use(express.json());
app.use(bp.urlencoded({ extended: true }));
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.json({ test: "world" });
  // res.send("^^b");
});

app.listen(3000, "192.168.219.59");
