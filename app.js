const express = require("express");

const app = express();
const cors = require("cors");
const bp = require("body-parser");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(bp.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/admin", adminRouter);

app.get("/", (req, res) => {
  res.json({ test: "world" });
  // res.send("^^b");
});

app.listen(3000);
