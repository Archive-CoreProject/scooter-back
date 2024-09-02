const express = require("express");
const { insertUser, verifyPassword, readUserList } = require("../config/user/crud");
const { authUser } = require("../config/security");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("User Router");
});

router.post("/login", async (req, res) => {
  console.log(req.body);
  const user = await authUser("hash", "qorlfwns2711");
  if (user) {
    res.send(user);
  } else {
    res.send("아이디 혹은 비밀번호가 일치하지 않습니다");
  }
});

router.post("/signup", async (req, res) => {
  const result = await insertUser(["hello"]);
  if (result === 1) {
    console.log("회원가입 성공");
  }
  res.send("signup API");
});

router.get("/users", async (req, res) => {
  const result = await readUserList();
  res.send(result);
});

module.exports = router;
