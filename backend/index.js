const express = require("express");
const app = express();
const { connectDB } = require("./db");
connectDB(); 
const path = require("path");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require("cors");
app.use(cors());

const mainRouter = require("./Router/mainRouter");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", mainRouter);

// const path = require("path");
// app.use(express.static(path.join(__dirname, "dist")));
// app.use((req, res, next) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });


app.listen(8000, () => {
  console.log("Server is running on port 8000");
});

