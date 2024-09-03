const express = require("express");
const { insertUser, getUser, readUserList } = require("../config/user/crud");
const { authUser } = require("../config/security");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("User Router");
});

router.post("/checkid", async (req, res) => {
  const userId = req.body.id;
  const result = await getUser(userId);
  if (result) {
    res.status(409).end();
  } else {
    res.status(200).end();
  }
});

router.post("/login", async (req, res) => {
  // console.log(req.body);
  const { userId, userPw } = req.body;
  const user = await authUser(userId, userPw);
  if (user.length > 0) {
    const data = user[0];
    let isAdmin = false;
    // role : "일반", "관리자", "제한" 존재
    if (data.user_role === "관리자") {
      isAdmin = true;
      console.log("관리자 계정 로그인");
    } else if (data.user_role === "제한") {
      // 사용 제한인 유저는 로그인 불가능
      res.status(403).send({ message: "사용이 제한된 계정입니다. 관리자에게 문의해주세요." }).end();
    } else {
      res.send({ userId: data.user_id, userName: data.user_name, phone: data.user_phone, admin: isAdmin });
    }
  } else {
    res.status(401).send({ message: "아이디 혹은 비밀번호가 잘못되었습니다." }).end();
  }
});

router.post("/signup", async (req, res) => {
  // userId, userPw, userName, birth, phone
  const userInfo = req.body;
  const result = await insertUser(userInfo);
  if (result) {
    console.log("회원가입 성공");
    res.status(200).end();
  } else {
    res.status(500).send({ message: "오류가 발생했습니다. 다시 시도해주세요." }).end();
  }
});

router.get("/users", async (req, res) => {
  const result = await readUserList();
  res.send(result);
});

module.exports = router;
