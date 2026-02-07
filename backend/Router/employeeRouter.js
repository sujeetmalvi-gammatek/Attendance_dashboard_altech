const express = require("express");
const employeeRouter = express.Router();
const { newEmployee, employeeList, departmentList ,employeeListDashBoard,  updateEmployeeData ,deleteEmployee , getEmployeeDetail } = require("../Controller/employee");


employeeRouter.post('/Table/List', employeeList)
employeeRouter.post("/ListDashBoard",employeeListDashBoard)

employeeRouter.get('/DepartmentList', departmentList)

employeeRouter.post("/NewEmployee", newEmployee)
employeeRouter.post("/Update",updateEmployeeData)
employeeRouter.post("/Delete",deleteEmployee)
employeeRouter.post("/Detail",getEmployeeDetail)


module.exports = employeeRouter;
