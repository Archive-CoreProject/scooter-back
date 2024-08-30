const express = require("express");
const app = express();
const userRouter = require("./routes/userRouter");

app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.send("^^b");
});

app.listen(3000);
