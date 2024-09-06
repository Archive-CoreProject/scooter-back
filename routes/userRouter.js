const express = require("express");
const { insertUser, getUser, readUserList, readUserHistory } = require("../config/user/crud");
const { authUser, verifyToken, verifyAdmin } = require("../config/security");
const router = express.Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

router.get("/", (req, res) => {
  res.send("User Router");
});

router.get("/verify", verifyToken, (req, res) => {
  const isAdmin = req.decoded.admin;
  res.status(200).send({ code: 200, message: "로그인 확인", isAdmin: isAdmin });
});

// 아이디 중복 체크 api
router.post("/checkid", async (req, res) => {
  const userId = req.body.userId;
  const result = await getUser(userId);
  if (result.length > 0) {
    res.status(409).end();
  } else {
    res.status(200).end();
  }
});

// 로그인 api
router.post("/login", async (req, res) => {
  const key = process.env.SECRET_KEY;
  const { userId, userPw } = req.body;
  const user = await authUser(userId, userPw);
  let token = "";

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
    }
    token = jwt.sign(
      {
        type: "JWT",
        userId: userId,
        admin: isAdmin,
      },
      key,
      {
        expiresIn: "600m",
        issuer: "토큰발급자",
      }
    );
    console.log("토큰 생성");
    res.status(200).send({ code: 200, message: "토큰 생성", token: token }).end();
  } else {
    res.status(401).send({ code: 401, message: "아이디 혹은 비밀번호가 잘못되었습니다." }).end();
  }
});

// 회원가입 api
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

// 가입한 유저 전체 조회 api
router.get("/users", verifyToken, verifyAdmin, async (req, res) => {
  const result = await readUserList();
  res.status(200).send({ code: 200, result });
});

// 특정 유저 이용내역 조회 api
router.get("/history", verifyToken, verifyAdmin, async (req, res) => {
  const { userId } = req.query;
  const result = await readUserHistory(userId);
  res.send(result);
});

module.exports = router;
