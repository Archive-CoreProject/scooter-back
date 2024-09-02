const express = require("express");
const https = require("https");
const fs = require("fs");

const app = express();
const cors = require("cors");
const bp = require("body-parser");
const userRouter = require("./routes/userRouter");

const options = {
  key: fs.readFileSync("./mkcert/localhost+2-key.pem"),
  cert: fs.readFileSync("./mkcert/localhost+2.pem"),
};

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(bp.urlencoded({ extended: true }));
app.use("/user", userRouter);

app.get("/", (req, res) => {
  res.json({ test: "world" });
  // res.send("^^b");
});

const httpsServer = https.createServer(options, app);

httpsServer.listen(3000, () => {
  console.log(options);
  console.log("HTTPS Server running on port 3000");
});
