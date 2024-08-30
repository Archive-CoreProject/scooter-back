const dotenv = require("dotenv");
const mysql = require("mysql2");

dotenv.config();

const conn = mysql.createConnection({
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DB,
  port: process.env.PORT,
  host: process.env.HOST,
});

conn.connect();

module.exports = conn;
