const conn = require("../database");

const updateUserRole = async (userId, role) => {
  const sql = "update tb_user set user_role = ? where user_id = ?";
  try {
    await conn.promise().query(sql, [role, userId]);
    conn.commit();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

// const

module.exports = { updateUserRole };
