const express = require("express");
const { verifyToken } = require("../config/security");
const { readRentalList } = require("../config/user/crud");
const router = express.Router();

// 결제 api

router.get("/", (req, res) => {
  res.send("Pay Router");
});

router.get("/pay-amount", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  console.log(userId);

  const result = await readRentalList(userId);
  res.status(200).send({ result: result });
});

module.exports = router;
