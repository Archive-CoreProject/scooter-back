const express = require("express");
const { verifyPassword, readUserList } = require("../config/user/crud");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("User Router");
});

router.get("/login", async (req, res) => {
  const user = await verifyPassword("qorlfwns2711");
  res.send(user);
});

router.get("/signup", (req, res) => {
  res.send("signup API");
});

router.get("/users", async (req, res) => {
  const result = await readUserList();
  res.send(result);
});

module.exports = router;
