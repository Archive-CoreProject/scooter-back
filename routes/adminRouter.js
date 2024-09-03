const express = require("express");
const { updateUserRole } = require("../config/admin/crud");
const { verifyToken, verifyAdmin } = require("../config/security");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Admin Router");
});

router.post("/update-role", verifyToken, verifyAdmin, async (req, res) => {
  const { userId, role } = req.body;
  const result = await updateUserRole(userId, role);
  if (result) {
    res.status(200).send({ code: 200, message: "유저 권한 수정" }).end();
  } else {
    res.status(500).send({ code: 500, message: "서버 오류 발생" }).end();
  }
});

router.get("/", (req, res) => {
  res.send("유저 킥보드 사용 정보 조회 API");
});

module.exports = router;
