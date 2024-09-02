const express = require("express");
const { updateUserRole } = require("../config/admin/crud");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Admin Router");
});

router.post("/update-role", async (req, res) => {
  const { userId, role } = req.body;
  const result = await updateUserRole(userId, role);
  if (result) {
    res.status(200).end();
  } else {
    res.status(403).end();
  }
});

router.get("/", (req, res) => {
  res.send("유저 킥보드 사용 정보 조회 API");
});

module.exports = router;
