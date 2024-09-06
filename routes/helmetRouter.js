const express = require("express");
const { updateSensorData } = require("../config/sensor/crud");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Helmet Router");
});

router.post("/set-data", async (req, res) => {
  const { alcohol, userId, helmetIdx } = req.body;

  console.log(req.body);
  await updateSensorData(userId, helmetIdx, alcohol / 10);
  res.status(200).send({ code: 200, message: "success" });
});

module.exports = router;
