const express = require("express");

const app = express();
const cors = require("cors");
const bp = require("body-parser");
const userRouter = require("./routes/userRouter");
const adminRouter = require("./routes/adminRouter");
const boardRouter = require("./routes/boardRouter");
const helmetRouter = require("./routes/helmetRouter");
const payRouter = require("./routes/payRouter");
const swaggerFile = require("./swagger-output.json");
const swaggerUI = require("swagger-ui-express");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(bp.urlencoded({ extended: true }));
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/board", boardRouter);
app.use("/helmet", helmetRouter);
app.use("/pay", payRouter);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerFile, { explorer: true }));

app.get("/", (req, res) => {
  res.json({ test: "world" });
  // res.send("^^b");
});

app.listen(3000);
