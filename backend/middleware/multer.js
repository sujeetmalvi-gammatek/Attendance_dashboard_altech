const multer = require("multer");
const path = require("path");

const imageConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    callback(null, `file_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype.startsWith("image") || file.mimetype === "application/pdf") {
    callback(null, true);
  } else {
    callback(new Error("Only images and PDF allowed"), false);
  }
};

const upload = multer({
  storage: imageConfig,
  fileFilter: fileFilter,
});

module.exports = upload;
