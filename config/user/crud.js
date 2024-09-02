const conn = require("../database");
const bcrypt = require("bcrypt");

const insertUser = async (userInfo) => {
  const hashedPw = await bcrypt.hash("qorlfwns2711", 10);
  console.log(hashedPw);
  const dummyInsertData = ["hash", hashedPw, "테스트", "030127", "010-5678-5678", "일반"];
  const sql =
    "insert into tb_user(user_id, user_pw, user_name, user_birthdate, user_phone, user_role) values(?,?,?,?,?,?)";

  try {
    const [rows, fields] = await conn.promise().query(sql, dummyInsertData);
    console.log(rows);
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
  return rows[0];
};

const readUserList = async () => {
  const sql = "select * from tb_user limit 10";

  const [rows, fields] = await conn.promise().query(sql);
  return rows;
};

module.exports = { insertUser, getUser, readUserList };
