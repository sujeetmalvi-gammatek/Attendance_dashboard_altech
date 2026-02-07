const express = require("express");
const router = express.Router();
const departmentRouter = require("./departmentRouter")
const employeeRouter = require('./employeeRouter')
const safetyRouter = require("./safetyRouter")

router.use("/Employee", employeeRouter);
router.use("/Safety", safetyRouter)
router.use("/Department" , departmentRouter)


module.exports = router;
