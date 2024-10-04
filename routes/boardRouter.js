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
  getMyScooterVerified,
  getUserAlcoholValue,
  insertRentalTryLog,
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
      await updateVerified(userId); // 인증통과상태로 변경
      await insertRentalTryLog(userId, scooterIdx); // 대여시도로그 DB에 추가
      await delAuthCode(userId); // 인증통과했으니 인증번호 삭제
    } catch (err) {
      console.log(err);
      res.status(500).send({ code: 500, message: "오류 발생" });
    }
    res.status(200).send({ code: 200, message: "인증 성공" });
  } else {
    res.status(403).send({ code: 403, message: "인증번호가 일치하지 않습니다." });
  }
});

// 이건 킥보드 보드에서 일정 시간마다 인증번호 확인하는 api
router.post("/read-code", async (req, res) => {
  console.log(req.body);

  const { scooterIdx } = req.body;
  const data = await getMyScooterIdxCode(scooterIdx);
  if (data) {
    const { auth_code, user_id, is_verified } = data;
    res.status(200).send({ authCode: auth_code, userId: user_id, isVerified: is_verified });
  } else {
    res.status(400).send("not created");
  }
});

// 헬멧 감지상태 업데이트 api
router.post("/update-detect", async (req, res) => {
  console.log("update-detect request:", req.body);

  const { scooterIdx, detected } = req.body;
  await updateUsedScooter(scooterIdx, detected);

  res.status(200).send({ code: 200, message: "헬멧 상태 업데이트" });
});

// 인증번호 검증 확인 api
router.post("/read-verified", async (req, res) => {
  console.log("read-verified request:", req.body);

  const { scooterIdx } = req.body;

  const result = await getMyScooterVerified(scooterIdx);

  if (result !== undefined && result.is_verified === 1) {
    res.status(200).send({ code: 200, message: "킥보드 사용중(해제)", isVerified: result.is_verified });
  } else {
    res.status(200).send({ code: 200, message: "킥보드 반납(잠금)", isVerified: 0 });
  }
});

// 알코올 수치 확인 api
router.get("/read-alcohol", async (req, res) => {
  console.log(req.query);
  const { idx, userId } = req.query;
  const data = await getUserAlcoholValue(idx, userId);
  console.log(data);
  if (data.length <= 0) {
    res.status(200).send({ code: 200, message: "음주 측정값 없음", accept: 0 });
    res.end();
  } else {
    const value = data[0].alcohol_value;
    if (value < 130) {
      // 알코올 수치 130 미만일때만 동작하도록 조건 추가
      res.send({ code: 200, message: "음주 측정 통과", accept: 1 });
    } else {
      res.send({ code: 200, message: "음주운전 하려고해요", accept: 0 });
    }
  }
});

// 사용 종료
router.post("/finish", verifyToken, async (req, res) => {
  const userId = req.decoded.userId;
  const { scooterIdx, rentalDt, rentalStTm, rentalRtTm, payMethod, paidAmount, paidStatus } = req.body;
  console.log(req.body);
  const data = await verifyDetected(scooterIdx);
  console.log(data);
  if (data.scooter_use === "Y") {
    const result = await finishUse(
      userId,
      scooterIdx,
      rentalDt,
      rentalStTm,
      rentalRtTm,
      payMethod,
      paidAmount,
      paidStatus
    );
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
