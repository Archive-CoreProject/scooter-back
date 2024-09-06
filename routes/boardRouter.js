const express = require("express");
const { getUserByPhone } = require("../config/user/crud");
const {
  insertAuthCode,
  getAuthCode,
  delAuthCode,
  getMyScooterIdxCode,
  updateVerified,
  finishUse,
  updateUsedScooter,
  verifyDetected,
} = require("../config/sensor/crud");
const { verifyToken } = require("../config/security");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Board Router").end();
});

// isVerified는 false로 넣을거라서 정의안하고 계산 완료(킥보드 사용종료)되면 다시 false로 변경할거임 (다른 api요청으로 한다는 뜻)
router.post("/generate-code", verifyToken, async (req, res) => {
  const { scooterIdx } = req.body;
  // 사용자가 요청 > 인증번호 생성
  const code = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
  // DB에 저장
  const result = await insertAuthCode(req.decoded.userId, code.toString(), scooterIdx.toString());
  if (result) {
    res.status(200).send({ code: 200, message: "인증번호 생성 성공" });
  } else {
    res.status(500).send({ code: 500, message: "오류 발생" });
  }
});

// 킥보드 고유값을 회원테이블에 저장한다면?
// 이건 프론트에서 인증번호 입력하는 api.
router.post("/check-code", verifyToken, async (req, res) => {
  // 웹페이지에서 인증번호 입력
  const { scooterIdx, code } = req.body;
  const userId = req.decoded.userId;
  console.log(req.body);

  const authCode = await getAuthCode(userId, scooterIdx);
  console.log(authCode);

  if (!authCode) {
    res.status(500).send({ code: 500, message: "오류 발생" });
  }

  if (authCode === code) {
    try {
      await updateVerified(userId);
      await delAuthCode(userId);
    } catch (err) {
      console.log(err);
      res.status(500).send({ code: 500, message: "오류 발생" });
    }
    res.status(200).send({ code: 200, message: "인증 성공" });
  } else {
    res.status(403).send({ code: 403, message: "인증번호가 일치하지 않습니다." });
  }
});

// 이건 보드에서 일정 시간마다 확인하는 api
router.post("/read-code", async (req, res) => {
  console.log(req.body); // 보드에 저장된 고유 킥보드 값을 보낼거임

  const { scooterIdx, detected } = req.body;
  await updateUsedScooter(scooterIdx, detected);
  const data = await getMyScooterIdxCode(scooterIdx);
  if (data) {
    const { auth_code, user_id, is_verified } = data;
    res.status(200).send({ authCode: auth_code, userId: user_id, isVerified: is_verified });
  } else {
    res.status(400).send("not created");
  }
});

// 테스트용으로 만든 api 안쓸거임
router.post("/sensor", (req, res) => {
  const data = req.body;
  console.log(data);

  res.status(200).send({ message: "data upload success" });
});

// 사용 종료
router.post("/finish", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const { scooterIdx } = req.body;
  const data = await verifyDetected(scooterIdx);
  console.log(data);
  if (data.scooter_use === "Y") {
    const result = await finishUse(userId);
    if (result) {
      res.status(200).send({ code: 200, message: "사용 정상 종료" });
    } else {
      res.status(500).send({ code: 500, message: "사용 종료 실패" });
    }
  } else {
    res.status(401).send({ code: 401, message: "헬멧을 보관함에 넣어주세요" });
  }
});

// 이거는 킥보드에서 키패드 입력으로 보내려고 했는데 일단 안쓰는 api
router.post("/auth-status", async (req, res) => {
  // 성공 시 userId, 성공 상태 전달
  const { inputCode, phone } = req.body;
  const formattedPhone = `010-${phone.slice(0, 4)}-${phone.slice(phone.length - 4)}`;
  const result = await getUserByPhone(formattedPhone);
  if (parseInt(inputCode) === req.session.code) {
    res.status(200).send({ status: true, userId: result.user_id });
  }
});

module.exports = router;
