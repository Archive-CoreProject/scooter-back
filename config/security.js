const conn = require("./database");
const bcrypt = require("bcrypt");
const { getUser } = require("./user/crud");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

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

const verifyToken = (req, res, next) => {
  const key = process.env.SECRET_KEY;
  // 인증 완료
  try {
    req.decoded = jwt.verify(req.headers.authorization, key);
    return next();
  } catch (err) {
    // 인증 실패
    // 유효시간이 초과된 경우
    if (err.name === "TokenExpiredError") {
      return res.status(419).send({ code: 419, message: "토큰 만료" }).end();
    }
    if (err.name === "JsonWebTokenError") {
      return res
        .status(401)
        .send({
          code: 401,
          message: "유효하지 않은 토큰",
        })
        .end();
    }
  }
};

// 세션값 검증하는 함수
//

const verifyAdmin = (req, res, next) => {
  if (req.decoded.admin) {
    return next();
  } else {
    return res.status(403).send({ code: 403, message: "권한이 없습니다." }).end();
  }
};

module.exports = { verifyPassword, authUser, verifyToken, verifyAdmin };
