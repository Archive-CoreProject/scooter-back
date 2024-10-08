const conn = require("../database");

const insertAuthCode = async (userId, code, scooterIdx) => {
  // const sql = "update tb_user set auth_code = ?, use_scooter_idx = ? where user_id = ?";
  const sql =
    "update tb_user set use_scooter_idx = ?, auth_code = ? where user_id = ? and exists(select 1 from tb_scooter where scooter_idx = ?)";
  try {
    const [rows] = await conn.promise().query(sql, [scooterIdx, code, userId, scooterIdx, parseInt(scooterIdx)]);
    console.log(rows.affectedRows > 0);
    if (rows.affectedRows > 0) {
      conn.commit();
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

// 유저가 요청하는 쿼리문
const getAuthCode = async (userId, scooterIdx) => {
  const sql = "select auth_code from tb_user where user_id = ? and use_scooter_idx = ?";
  try {
    const [rows] = await conn.promise().query(sql, [userId, scooterIdx]);
    if (rows.length > 0) {
      return rows[0].auth_code;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

// 킥보드에서 요청하는 쿼리문
const getMyScooterIdxCode = async (scooterIdx) => {
  const sql = "select auth_code, user_id, is_verified from tb_user where use_scooter_idx = ?";
  try {
    const [rows] = await conn.promise().query(sql, [scooterIdx]);
    console.log(rows);
    return rows[0];
  } catch (err) {
    console.log(err.sqlMessage);
  }
};

// 사용자가 이용하는 킥보드 인증번호 통과했는지 확인하는 쿼리문
const getMyScooterVerified = async (scooterIdx) => {
  const sql = "select is_verified from tb_user where use_scooter_idx = ?";
  try {
    const [rows] = await conn.promise().query(sql, [scooterIdx]);
    // console.log(rows);
    return rows[0];
  } catch (err) {
    console.log(err.message);
  }
};

// 현재 날짜의 가장 최근 음주감지기록 추출
const getUserAlcoholValue = async (idx, userId) => {
  // 현재시간 기준 5분 전부터만 음주감지기록 조회
  const sql =
    "select * from tb_alcohol_detection where detected_at between now() - interval 5 minute and now() and user_id = ? and hm_idx = ? order by detected_at desc limit 1";
  try {
    const [rows] = await conn.promise().query(sql, [userId, idx]);
    console.log(rows);
    return rows;
  } catch (err) {
    console.log(err.message);
  }
};

// 헬멧이 보관함에 담겨있을 때 / 없을 때 사용중인거 업데이트하는 쿼리문
const updateUsedScooter = async (scooterIdx, detected) => {
  const sql = "update tb_scooter set scooter_use = ? where scooter_idx = ?";

  await conn.promise().query(sql, [detected, scooterIdx]);
  conn.commit();
};

// 인증통과상태로 변경하는 쿼리문
const updateVerified = async (userId) => {
  const sql = "update tb_user set is_verified = 1 where user_id = ?";

  await conn.promise().query(sql, [userId]);
  conn.commit();
};

// 인증 통과하면 대여시도기록 테이블에 로그 추가
const insertRentalTryLog = async (userId, scooterIdx) => {
  const sql = "insert into tb_rental_log(user_id, scooter_idx) values(?,?)";

  try {
    await conn.promise().query(sql, [userId, scooterIdx]);
  } catch (err) {
    console.log(err);
  }
};

// 헬멧이 보관함에 담겨있는지 확인하는 쿼리문
const verifyDetected = async (scooterIdx) => {
  const sql = "select scooter_use from tb_scooter where scooter_idx = ?";

  const [rows] = await conn.promise().query(sql, [scooterIdx]);
  return rows[0];
};

const delAuthCode = async (userId) => {
  const sql = "update tb_user set auth_code = null where user_id = ?";

  try {
    await conn.promise().query(sql, [userId]);
    conn.commit();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const updateSensorData = async (userId, hmIdx, alcohol) => {
  const sql = "insert into tb_alcohol_detection(user_id, hm_idx, alcohol_value) values(?,?,?)";
  try {
    await conn.promise().query(sql, [userId, hmIdx, alcohol]);
    conn.commit();
    console.log("헬멧 알코올 감지 기록");
  } catch (err) {
    console.log(err);
  }
};

// 반납하면 사용한 스쿠터 식별자, isVerified 삭제
const finishUse = async (userId, scooterIdx, rentalDt, rentalStTm, rentalRtTm, payMethod, paidAmount, paidStatus) => {
  const updateSQL = "update tb_user set is_verified = 0, use_scooter_idx = null where user_id = ?";
  const insertSQL =
    "insert into tb_rental(user_id, scooter_idx, rental_dt, rental_st_tm, rental_rt_tm, pay_method, paid_amount, paid_status) values(?,?,?,?,?,?,?,?)";
  const [rows] = await conn.promise().query(updateSQL, [userId]);
  const [insertRows] = await conn
    .promise()
    .query(insertSQL, [userId, scooterIdx, rentalDt, rentalStTm, rentalRtTm, payMethod, paidAmount, paidStatus]);
  if (rows.affectedRows > 0) {
    conn.commit();
    return true;
  } else {
    return false;
  }
};

module.exports = {
  updateSensorData,
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
};
