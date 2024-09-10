const conn = require("../database");
const bcrypt = require("bcrypt");

const insertUser = async (userInfo) => {
  const { userId, userPw, userName, birth, phone } = userInfo;
  const hashedPw = await bcrypt.hash(userPw, 10);
  const data = [userId, hashedPw, userName, birth, phone, "일반"];
  const sql =
    "insert into tb_user(user_id, user_pw, user_name, user_birthdate, user_phone, user_role) values(?,?,?,?,?,?)";

  try {
    await conn.promise().query(sql, data);
    conn.commit();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getUser = async (userId) => {
  const sql = "select * from tb_user where user_id = ?";
  const [rows] = await conn.promise().query(sql, [userId]);
  if (rows) {
    return rows;
  } else {
    return [];
  }
};

const getUserByPhone = async (phone) => {
  const sql = "select user_id from tb_user where user_phone = ?";
  const [rows] = await conn.promise().query(sql, [phone]);
  return rows[0];
};

const readUserList = async () => {
  const sql =
    "select user_id, user_name, user_role, user_phone from tb_user where user_role != '관리자' order by joined_at";

  const [rows, fields] = await conn.promise().query(sql);
  return rows;
};

const readUserHistory = async (userId) => {
  // 날짜, 킥보드식별자, 대여 시작/반납 시간, 결제 금액
  const sql = "select scooter_idx, rental_dt, rental_st_tm, rental_rt_tm, paid_amount from tb_rental where user_id = ?";

  const [rows, fields] = await conn.promise().query(sql, [userId]);
  return rows;
};

const readRentalList = async (userId) => {
  const sql = "select rental_dt, rental_st_tm, rental_rt_tm, paid_amount from tb_rental where user_id = ?";

  const [rows] = await conn.promise().query(sql, [userId]);
  return rows;
};

module.exports = { insertUser, getUser, getUserByPhone, readUserList, readUserHistory, readRentalList };
