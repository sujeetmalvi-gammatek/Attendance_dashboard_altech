const sql = require("mssql");
require("dotenv").config();

const dbConfig = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port :1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log("SQL Connected Successfully");
  } catch (err) {
    console.error("SQL Connection Error:", err);
  }
}

module.exports = { sql, connectDB };
