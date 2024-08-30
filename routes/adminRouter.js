const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Admin Router");
});

router.post("/", (req, res) => {
  res.send("유저 상태 관리 API");
});

router.get("/", (req, res) => {
  res.send("유저 킥보드 사용 정보 조회 API");
});
