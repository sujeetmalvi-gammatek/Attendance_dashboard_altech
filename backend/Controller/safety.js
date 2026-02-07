
const { sql } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  success,
  unknownError,
  badRequest,
  notFound,
} = require("../middleware/response.globalHelper");


const createOrUpdateDashboardSetting = async (req, res) => {
  try {
    const data = { ...req.body };
    if (Array.isArray(data?.departmentBoxColors)) {
      data.departmentBoxColors = JSON.stringify(data.departmentBoxColors);
    }
    delete data?.CreateDate;
    delete data?.UpdateDate;
    delete data?.id;
    delete data?.SettingId;
    delete data?.Status;
    const pool = await sql.connect();
    const check = await pool.request().query(`
      SELECT TOP 1 * FROM Setting
    `);
    // -------------------- CREATE --------------------
    if (check?.recordset?.length === 0) {
      const keys = Object.keys(data);
      const cols = keys.join(", ");
      const params = keys.map((k) => "@" + k).join(", ");
      const request = pool.request();
      keys.forEach((k) => request.input(k, sql.NVarChar, data[k]));
      const insertQuery = `
        INSERT INTO Setting (${cols}, CreateDate, UpdateDate)
        OUTPUT INSERTED.*
        VALUES (${params}, GETDATE(), GETDATE())
      `;
      const inserted = await request.query(insertQuery);
      const result = inserted.recordset[0];
      if (result?.departmentBoxColors) {
        result.departmentBoxColors = JSON.parse(result.departmentBoxColors);
      }
      return success(res, "Dashboard Setting Created", {
        isNew: true,
        data: result,
      });
    }
    // -------------------- UPDATE --------------------
    const existing = check?.recordset[0];
    console.log('EXIS',existing);
    
    // const id = existing?.id;
    const keys = Object.keys(data);
    const updates = keys.map((k) => `${k} = @${k}`).join(", ");
    const request = pool.request();
    keys.forEach((k) => request.input(k, sql.NVarChar, data[k]));
    // request.input("id", sql.Int, id);
    const updateQuery = `
      UPDATE Setting SET 
        ${updates},
        UpdateDate = GETDATE()
      OUTPUT INSERTED.*
     
    `;
    const updated = await request.query(updateQuery);
    const result = updated?.recordset[0];
    if (result?.departmentBoxColors) {
      result.departmentBoxColors = JSON.parse(result.departmentBoxColors);
    }
    return success(res, "Dashboard Setting Updated", {
      isNew: false,
      data: result,
    });
  } catch (error) {
    console.log(error);
    
    return unknownError(res, error.message);
  }
};

const getDashboardSetting = async (req, res) => {
  try {
    const pool = await sql.connect();
    const result = await pool.request().query(`
            SELECT TOP 1 * FROM Setting`);
    return success(res, "Dashboard Setting", result.recordset[0]);
  } catch (error) {
    return unknownError(res, error.message);
  }
};


const imageUpload = (req, res) => {
    try {

        const { type } = req.body || "user";
        if (!req.file) {
            return badRequest(res, "No file uploaded");
        }
        const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        return success(res, "File Uploaded", {
            fileUrl,
        });
    } catch (error) {
        return unknownError(res, error.message);
    }
};

// const createSafetyDashboard = async (req, res) => {
//   try {
//     const {
//       companyName,
//       boardTitle,
//       lastReportedAccidentDate,
//       reportableAccidentFreeDays,
//       safeManHours,
//       safetyAwardsName,
//     } = req.body;
//     if (!companyName) {
//       return badRequest(res, "companyName is required");
//     }
//     const pool = await sql.connect();
//     const check = await pool
//       .request()
//       .input("companyName", sql.VarChar, companyName).query(`
//                 SELECT * FROM CompanyDetail 
//                 WHERE companyName = @companyName
//             `);
//     if (check.recordset.length === 0) {
//       const insertRes = await pool
//         .request()
//         .input("companyName", sql.VarChar, companyName)
//         .input("boardTitle", sql.VarChar, boardTitle)
//         .input(
//           "lastReportedAccidentDate",
//           sql.VarChar,
//           lastReportedAccidentDate
//         )
//         .input(
//           "reportableAccidentFreeDays",
//           sql.Int,
//           reportableAccidentFreeDays
//         )
//         .input("safeManHours", sql.Int, safeManHours)
//         .input("safetyAwardsName", sql.VarChar, safetyAwardsName).query(`
//                     INSERT INTO CompanyDetail 
//                     (companyName, boardTitle, lastReportedAccidentDate, reportableAccidentFreeDays, safeManHours, safetyAwardsName, status, CreateDate, UpdateDate)
//                     OUTPUT INSERTED.*
//                     VALUES (@companyName, @boardTitle, @lastReportedAccidentDate, @reportableAccidentFreeDays, @safeManHours, @safetyAwardsName, 'active', GETDATE(), GETDATE())
//                 `);
//       const createdData = insertRes.recordset[0];
//       return success(res, "Created Successfully", {
//         isNew: true,
//         data: createdData,
//       });
//     }
//     const old = check.recordset[0];
//     const updateRes = await pool
//       .request()
//       .input("companyName", sql.VarChar, companyName)
//       .input("boardTitle", sql.VarChar, boardTitle || old.boardTitle)
//       .input(
//         "lastReportedAccidentDate",
//         sql.VarChar,
//         lastReportedAccidentDate || old.lastReportedAccidentDate
//       )
//       .input(
//         "reportableAccidentFreeDays",
//         sql.Int,
//         reportableAccidentFreeDays ?? old.reportableAccidentFreeDays
//       )
//       .input("safeManHours", sql.Int, safeManHours ?? old.safeManHours)
//       .input(
//         "safetyAwardsName",
//         sql.VarChar,
//         safetyAwardsName || old.safetyAwardsName
//       ).query(`
//                 UPDATE CompanyDetail SET
//                     boardTitle = @boardTitle,
//                     lastReportedAccidentDate = @lastReportedAccidentDate,
//                     reportableAccidentFreeDays = @reportableAccidentFreeDays,
//                     safeManHours = @safeManHours,
//                     safetyAwardsName = @safetyAwardsName,
//                     UpdateDate = GETDATE()
//                 OUTPUT INSERTED.*
//                 WHERE companyName = @companyName
//             `);

//     const updatedData = updateRes.recordset[0];
//     return success(res, "Updated Successfully", {
//       isNew: false,
//       data: updatedData,
//     });
//   } catch (error) {
//     return unknownError(res, error.message);
//   }
// };
// const getSafetyDashboard = async (req, res) => {
//   try {
//     const { id } = req.body || {};
//     const pool = await sql.connect();
//     const result = await pool
//       .request()
//       .input("id", sql.Int, id)
//       .query("SELECT * FROM Employee WHERE id = @id");
//     if (result.recordset.length === 0) {
//       return notFound(res, "Record not found");
//     }
//     return success(res, "Dashboard Details", result.recordset[0]);
//   } catch (error) {
//     return unknownError(res, error.message);
//   }
// };
// const updateSafetyDashboardStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const pool = await sql.connect();
//     const existing = await pool
//       .request()
//       .input("id", sql.Int, id)
//       .query(`SELECT * FROM CompanyDetail WHERE id = @id`);
//     if (existing.recordset.length === 0) {
//       return badRequest(res, "Record Not Found");
//     }
//     await pool
//       .request()
//       .input("id", sql.Int, id)
//       .input("status", sql.VarChar, status).query(`
//                 UPDATE CompanyDetail 
//                 SET status = @status, UpdateDate = GETDATE()
//                 WHERE id = @id
//             `);
//     return success(res, `Status updated to ${status}`, {});
//   } catch (error) {
//     return unknownError(res, error.message);
//   }
// };
// const listSafetyDashboard = async (req, res) => {
//   try {
//     const pool = await sql.connect();
//     const result = await pool
//       .request()
//       .query("SELECT * FROM CompanyDetail ORDER BY id DESC");

//     return success(res, "Dashboard List", {
//       count: result.recordset.length,
//       list: result.recordset,
//     });
//   } catch (error) {
//     return unknownError(res, error.message);
//   }
// };

module.exports = {
  createOrUpdateDashboardSetting,
  getDashboardSetting,
  imageUpload,
};
