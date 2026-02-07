const express = require("express");
const safetyRouter = express.Router();
const upload = require("../middleware/multer");
const {
  createOrUpdateDashboardSetting,
  getDashboardSetting,
  imageUpload,
} = require("../Controller/safety");


safetyRouter.post("/Setting/Create", createOrUpdateDashboardSetting);
safetyRouter.get("/Setting/Get" ,getDashboardSetting)
safetyRouter.post("/imageUpload", upload.single("image"), imageUpload);

module.exports = safetyRouter;
