const { sql } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  success,
  unknownError,
  badRequest,
  notFound,
} = require("../middleware/response.globalHelper");

const newEmployee = async (req, res) => {
  const { Name, EmpCode, Department, Category } = req.body;
  try {
    if (!Name || !EmpCode || !Department) {
      return badRequest(res, "All fields are required");
    }
    const pool = await sql.connect();
    const check = await pool.request().input("EmpCode", sql.VarChar, EmpCode)
      .query(`
                SELECT * FROM Employee 
                WHERE EmpCode = @EmpCode
            `);
    if (check.recordset.length > 0) {
      const exist = check.recordset[0];
      return badRequest(res, "Emp Code Already Exist")
    }
    const result = await pool
      .request()
      .input("Name", sql.VarChar, Name)
      .input("EmpCode", sql.VarChar, EmpCode)
      .input("Department", sql.VarChar, Department)
      .input("Category", sql.VarChar, Category).query(`
                INSERT INTO Employee (Name, EmpCode, Department , Category)
                OUTPUT INSERTED.*
                VALUES (@Name, @EmpCode, @Department , @Category)
            `);

    const user = result.recordset[0];
    return success(res, "Employee created successfully", {
      employee: {
        ID: user.ID,
        Name: user.Name,
        EmpCode: user.EmpCode,
        Department: user.Department,
        Category: user.Category,
      },
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

const newEmployeeBulk = async (req, res) => {
  const { employees } = req.body;

  try {
    if (!Array.isArray(employees) || employees.length === 0) {
      return badRequest(res, "Employees array is required");
    }

    const pool = await sql.connect();

    // 🔍 Collect EmpCodes
    const empCodes = employees.map(e => e.EmpCode);

    // 🔍 Check existing EmpCodes
    const existing = await pool.request()
      .query(`
        SELECT EmpCode 
        FROM Employee 
        WHERE EmpCode IN (${empCodes.map(code => `'${code}'`).join(",")})
      `);

    const existingCodes = existing.recordset.map(e => e.EmpCode);

    // ❌ Remove duplicate EmpCodes
    const filteredEmployees = employees.filter(
      e => !existingCodes.includes(e.EmpCode)
    );

    if (filteredEmployees.length === 0) {
      return badRequest(res, "All EmpCodes already exist");
    }

    // 🔥 Build bulk insert query
    const values = filteredEmployees.map((_, i) =>
      `(@Name${i}, @EmpCode${i}, @Department${i}, @Category${i})`
    ).join(",");

    const request = pool.request();

    filteredEmployees.forEach((emp, i) => {
      request
        .input(`Name${i}`, sql.VarChar, emp.Name)
        .input(`EmpCode${i}`, sql.VarChar, emp.EmpCode)
        .input(`Department${i}`, sql.VarChar, emp.Department)
        .input(`Category${i}`, sql.VarChar, emp.Category);
    });

    const query = `
      INSERT INTO Employee (Name, EmpCode, Department, Category)
      OUTPUT INSERTED.*
      VALUES ${values}
    `;

    const result = await request.query(query);

    return success(res, "Employees created successfully", {
      insertedCount: result.recordset.length,
      insertedEmployees: result.recordset,
      skippedEmpCodes: existingCodes
    });

  } catch (error) {
    return unknownError(res, error.message);
  }
};

const employeeList = async (req, res) => {
  try {
    const { Category } = req.body;
    const pool = await sql.connect();
    let employeeList;
    if (Category) {
      employeeList = await pool
        .request()
        .input("Category", sql.VarChar, Category).query(`
                SELECT * FROM Employee WHERE Category= @Category`);
    } else {
      employeeList = await pool.request().query(`
                SELECT * FROM Employee`);
    }
    return success(res, "Employee List", {
      count: employeeList.recordsets[0].length,
      list: employeeList.recordsets[0],
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

const employeeListDashBoard = async (req, res) => {
  try {
    let { Category, Search, Limit = 10000, Page = 1 } = req.body;

    Page = Number(Page);
    Limit = Number(Limit);

    const pool = await sql.connect();
    let whereClauses = [];
    let request = pool.request();

    if (Category && Category !== "") {
      whereClauses.push("Category = @Category");
      request.input("Category", sql.VarChar, Category);
    }

    if (Search && Search.trim() !== "") {
      const searchValue = `%${Search}%`;
      whereClauses.push(
        "(Name LIKE @Search OR Department LIKE @Search OR EmpCode LIKE @Search)"
      );
      request.input("Search", sql.VarChar, searchValue);
    }

    let whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";
    const offset = (Page - 1) * Limit;
    request.input("Limit", sql.Int, Limit);
    request.input("Offset", sql.Int, offset);

    const countQuery = `
      SELECT COUNT(*) AS Total
      FROM Employee
      ${whereSQL}
    `;
    const countResult = await request.query(countQuery);
    const Total = countResult.recordset[0].Total;

    const dataQuery = `
      SELECT *
      FROM Employee
      ${whereSQL}
      ORDER BY Name ASC
      OFFSET @Offset ROWS
      FETCH NEXT @Limit ROWS ONLY
    `;
    const listResult = await request.query(dataQuery);

    const totalPages = Math.ceil(Total / Limit);

    return success(res, "Employee List", {
      page: Page,
      limit: Limit,
      total: Total,
      totalPages,
      nextPage: Page < totalPages ? Page + 1 : null,
      prevPage: Page > 1 ? Page - 1 : null,
      list: listResult.recordset,
    });

  } catch (error) {
    return unknownError(res, error.message);
  }
};

const departmentList = async (req, res) => {
  try {
    const pool = await sql.connect();

    const settingRes = await pool.request().query(`
      SELECT TOP 1 departmentBoxColors FROM Setting
    `);

    let storedColors = [];

    try {
      storedColors = JSON.parse(settingRes.recordset[0].departmentBoxColors);
    } catch {
      storedColors = [];
    }

    const departmentRes = await pool.request().query(`
      SELECT 
          Department,
          COUNT(*) AS TotalEmployees
      FROM Employee
      GROUP BY Department
    `);

    const totalRes = await pool.request().query(`
      SELECT COUNT(*) AS TotalEmployees FROM Employee
    `);

    let deptList = departmentRes.recordset;

    deptList.sort((a, b) => {
      const A = (a.Department || "").replace(/\s/g, "").toLowerCase();
      const B = (b.Department || "").replace(/\s/g, "").toLowerCase();
      const isA = A.includes("srf") || A.includes("sfr");
      const isB = B.includes("srf") || B.includes("sfr");

      if (isA && !isB) return -1;
      if (!isA && isB) return 1;

      return A.localeCompare(B);
    });

    deptList = deptList.map((d, i) => ({
      ...d,
      color: storedColors[i] || "#318ce7"
    }));

    return success(res, "Department Count List", {
      totalEmployees: totalRes.recordset[0].TotalEmployees,
      count: deptList.length,
      list: deptList,
      colors: storedColors
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
};

const updateEmployeeData = async (req, res) => {
  try {
    const { id, Name, EmpCode, Department, Category } = req.body;
    if (!id) return badRequest(res, "Employee id Needed!");
    const pool = await sql.connect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .input("Name", sql.VarChar, Name)
      .input("EmpCode", sql.VarChar, EmpCode)
      .input("Department", sql.VarChar, Department)
      .input("Category", sql.VarChar, Category).query(`
        UPDATE Employee 
        SET Name=@Name, EmpCode=@EmpCode, Department=@Department, Category=@Category, UpdatedDate=GETDATE()
        WHERE id=@id
      `);

    return success(res, "Employee Updated Successfully");
  } catch (err) {
    return unknownError(res, err.message);
  }
};

const getEmployeeDetail = async (req, res) => {
  try {
    const { id } = req.body || {};
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT * FROM Employee WHERE id = @id");
    if (result.recordset.length === 0) {
      return notFound(res, "Record not found");
    }
    return success(res, "Dashboard Details", result.recordset[0]);
  } catch (error) {
    return unknownError(res, error.message);
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.body || {};
    const pool = await sql.connect();
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Employee WHERE id = @id");
    return success(res, "Deleted Successfully", {});
  } catch (error) {
    return unknownError(res, error.message);
  }
};

module.exports = {
  newEmployee,
  employeeList,
  employeeListDashBoard,
  departmentList,
  updateEmployeeData,
  deleteEmployee,
  getEmployeeDetail,
};
