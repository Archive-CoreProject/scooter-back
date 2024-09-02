const conn = require("./database");
const bcrypt = require("bcrypt");
const { getUser } = require("./user/crud");

const authUser = async (userId, password) => {
  const user = await getUser(userId, password);
  if (!user) {
    return false;
  }
  if (!(await verifyPassword(password, user["user_pw"]))) {
    return false;
  }
  return user;
};

const verifyPassword = async (plainPw, hashedPw) => {
  return bcrypt.compare(plainPw, hashedPw);
};

module.exports = { verifyPassword, authUser };
