const { sql } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  success,
  unknownError,
  badRequest,
  notFound,
} = require("../middleware/response.globalHelper");

const companyCreate = async (req, res) => {
  const { Name } = req.body;

  try {
    if (!Name) {
      return badRequest(res, "Company name is required");
    }

    const pool = await sql.connect();

    // check duplicate company
    const checkCompany = await pool
      .request()
      .input("Name", sql.VarChar, Name.trim())
      .query(`SELECT * FROM CompanyDetail WHERE Name = @Name`);

    if (checkCompany.recordset.length > 0) {
      return badRequest(res, "Company already exists");
    }

    const result = await pool
      .request()
      .input("Name", sql.VarChar, Name.trim())
      .query(`
        INSERT INTO CompanyDetail (Name)
        OUTPUT INSERTED.*
        VALUES (@Name)
      `);

    return success(res, "Company created successfully", {
      company: result.recordset[0],
    });

  } catch (error) {
    return unknownError(res, error.message);
  }
};

const departmentList = async (req, res) => {
  try {
    const { CompanyId } = req.query || {};
    // if (!CompanyId) {
    //   return badRequest(res, "Company Id Required");
    // }
    const pool = await sql.connect();
    const companyCheck = await pool
      .request()
      .query(`SELECT * FROM CompanyDetail`);
    // if (companyCheck.recordset.length === 0) {
    //   return badRequest(res, "Company Not Found");
    // }
    // const departmentResult = await pool
    //   .request()
    //   .input("CompanyId", sql.Int, CompanyId)
    //   .query(`SELECT * FROM Department WHERE id = @CompanyId`);
    const list = companyCheck.recordset;
    return success(res, "Department List", {
      count: list.length,
      list: list,
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

module.exports = {
  companyCreate,
  departmentList,
};
