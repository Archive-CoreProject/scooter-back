const conn = require("./database");
const bcrypt = require("bcrypt");
const { getUser } = require("./user/crud");

const authUser = async (userId, password) => {
  const user = await getUser(userId, password);
  if (user.length === 0) {
    return false;
  }
  const isVerified = await verifyPassword(password, user[0]["user_pw"]);
  if (!isVerified) {
    return false;
  }

  return user;
};

const verifyPassword = async (plainPw, hashedPw) => {
  return bcrypt.compare(plainPw, hashedPw);
};

module.exports = { verifyPassword, authUser };
