const conn = require("../database");

const verifyPassword = async (password) => {
  const sql = "select * from tb_user where user_pw = ?";

  try {
    const [rows, fields] = await conn.promise().query(sql, [password]);
    return rows;
  } catch {
    return;
  }
};

const readUserList = async () => {
  const sql = "select * from tb_user limit 10";

  const [rows, fields] = await conn.promise().query(sql);
  return rows;
};

module.exports = { verifyPassword, readUserList };
