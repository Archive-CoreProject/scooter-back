const express = require("express");
const { verifyToken } = require("../config/security");
const router = express.Router();

// 결제 api

router.get("/", (req, res) => {
  res.send("Pay Router");
});

// 결제페이지는 이용중일땐 프론트에서 계산한 금액만 보여주도록 하자.
// 이용 종료되면 (DB값 들어가면) 결제 내역 노출
// ㄴㄴ 이거 생각 다시해봐야됨 일단 09.05일에 다시 생각하는걸로
router.get("/pay-amount", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
});

module.exports = router;
