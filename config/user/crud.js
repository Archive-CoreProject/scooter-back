const conn = require("../database");
const bcrypt = require("bcrypt");

const insertUser = async (userInfo) => {
  const { userId, userPw, userName, birth, phone, role } = userInfo;
  const hashedPw = await bcrypt.hash(userPw, 10);
  const data = [userId, hashedPw, userName, birth, phone, role];
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

const readUserList = async () => {
  const sql = "select * from tb_user order by joined_at";

  const [rows, fields] = await conn.promise().query(sql);
  return rows;
};

module.exports = { insertUser, getUser, readUserList };
