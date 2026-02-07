const jwt = require("jsonwebtoken");
const sql = require("mssql");
const { poolPromise } = require("../db");
const checkUserAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.token;
        if (!authHeader) {
            return res.status(401).json({
                status: "Failed",
                message: "Unauthorized user",
            });
        }
        const token = authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("id", sql.Int, decoded.userID)
            .query("SELECT id, name, email FROM Employees WHERE id = @id");
        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({
                status: "Failed",
                message: "Invalid Token",
            });
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            status: "Error",
            message: error.message,
        });
    }
};

module.exports = checkUserAuth;
