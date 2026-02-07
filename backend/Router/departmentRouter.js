const express = require('express')
const departmentRouter = express.Router()
const { companyCreate , departmentList } = require('../Controller/department')


departmentRouter.post("/Create",companyCreate)
departmentRouter.get("/List", departmentList)


module.exports = departmentRouter;
