import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Setting() {
  const navigate = useNavigate();
  const [deptList, setDeptList] = useState([]);
  const [showPass, setShowPass] = useState(false);
  const [formData, setFormData] = useState({
    bodyBgColor: "",
    companyName: "",
    companyTextColor: "",
    boardTitle: "",
    boardTitleTextColor: "",
    totalEmpColor: "",
    blackBoxBgColor: "",
    blackBoxTextColor: "",
    blackBoxCenterText: "",
    blackBoxFirstText: "",
    lastReportedAccidentDate: "",
    blackBoxSecondText: "",
    reportableAccidentFreeDays: "",
    blackBoxThirdText: "",
    safeManHours: "",
    departmentBoxColors: [],
    departmentBoxBgColor: "",
    departmentManBoxColor: "",
    departmentBoxTextColor: "",
    table1HeadingBgColor: "",
    table1HeadingTextColor: "",
    table1HeadingText: "",
    table2HeadingBgColor: "",
    table2HeadingTextColor: "",
    table2HeadingText: "",
    awardsSectionBgColor: "",
    awardsSectionTextColor: "",
    awardsSectionText: "",
    SafetyEmployeeName: "",
    SafetyObservationName: "",
    SafetyContractorName: "",
    SafetyEmployeeBgColor: "",
    SafetyEmployeeTextColor: "",
    SafetyEmployeeText: "",
    SafetyContractorBgColor: "",
    SafetyContractorTextColor: "",
    SafetyContractorText: "",
    SafetyObservationBgColor: "",
    SafetyObservationTextColor: "",
    SafetyObservationText: "",
    SafetyEmployeeImageUrl: "",
    SafetyContractorImageUrl: "",
    SafetyObservationImageUrl: "",
    passCode: "",
  });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const uploadImage = async (file, fieldName) => {
    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch(
        `http://localhost:8000/Safety/imageUpload`,
        {
          method: "POST",
          body: fd,
        }
      );

      const data = await res.json();

      if (data) {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: data.items.fileUrl,
        }));
      }
    } catch (err) {
      console.error("Image upload failed", err);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/Safety/Setting/Get")
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          const items = data.items;
          try {
            const parsed = JSON.parse(items.departmentBoxColors);
            items.departmentBoxColors = Array.isArray(parsed) ? parsed : [];
          } catch (e) {
            items.departmentBoxColors = [];
          }
          setFormData(items);
        }
      });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    fetch("http://localhost:8000/Employee/DepartmentList")
      .then((res) => res.json())
      .then((data) => {
        const list = data?.items?.list || [];

        setDeptList(list);

        setFormData((prev) => ({
          ...prev,
          departmentBoxColors: list.map((d) => d.color || "#318ce7"),
        }));
      })
      .catch((err) => console.error("Department fetch error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const provided = (formData.passCode || "").trim();
    const expected = "123";
    if (provided !== expected) {
      setSnack({
        open: true,
        message: "Password Wrong",
        severity: "error",
      });
      return;
    }
    try {
      const sendData = { ...formData };
      sendData.departmentBoxColors = JSON.stringify(
        formData.departmentBoxColors || []
      );
      delete sendData.id;
      delete sendData.passCode;
      const res = await fetch("http://localhost:8000/Safety/Setting/Create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sendData),
      });
      if (res.ok) {
        setSnack({
          open: true,
          message: "Saved Successfully!",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/");
        }, 800);
      } else {
        const text = await res.text();
        setSnack({
          open: true,
          message: "Save failed: " + (text || `Status ${res.status}`),
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Save error:", err);
      setSnack({
        open: true,
        message: "Save failed: network or server error.",
        severity: "error",
      });
    }
  };

  return (
    <>
      <Box sx={{ maxWidth: "1200px", margin: "30px auto" }}>
        <Card sx={{ p: 3, boxShadow: 4, borderRadius: "12px" }}>
          <CardContent>
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", mb: 3, textAlign: "center" }}
            >
              Safety Dashboard Settings
            </Typography>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* ------------- Group 1: Company & Board ------------- */}

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Body Color &nbsp; : - &nbsp;</label>
                    <Box>
                      <input
                        type="color"
                        name="bodyBgColor"
                        value={formData.bodyBgColor}
                        onChange={handleChange}
                        style={{
                          marginTop: "6px",
                          width: "40px",
                          height: "30px",
                          border: "none",
                          cursor: "pointer",
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Box width="100%"></Box>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Company Name"
                    name="companyName"
                    sx={{ width: "350px" }}
                    value={formData.companyName}
                    onChange={handleChange}
                    variant="standard"
                    fullWidth
                    InputProps={{
                      style: {
                        color: formData.companyTextColor,
                      },
                    }}
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <input
                      type="color"
                      name="companyTextColor"
                      value={formData.companyTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Board Title"
                    name="boardTitle"
                    variant="standard"
                    sx={{ width: "350px" }}
                    value={formData.boardTitle}
                    onChange={handleChange}
                    fullWidth
                    InputProps={{
                      style: {
                        color: formData.boardTitleTextColor,
                      },
                    }}
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <input
                      type="color"
                      name="boardTitleTextColor"
                      value={formData.boardTitleTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>
                <Box width="100%"></Box>
                {/* ------------- Group 2: Black Box Section ------------- */}
                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Box BgColor &nbsp; : - &nbsp; </label>
                    <input
                      type="color"
                      name="blackBoxBgColor"
                      value={formData.blackBoxBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Box Text Color &nbsp; : - &nbsp;</label>
                    <input
                      type="color"
                      name="blackBoxTextColor"
                      value={formData.blackBoxTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Center Text"
                    name="blackBoxCenterText"
                    variant="standard"
                    sx={{ width: "250px" }}
                    value={formData.blackBoxCenterText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="First Line Text"
                    name="blackBoxFirstText"
                    sx={{ width: "350px" }}
                    variant="standard"
                    value={formData.blackBoxFirstText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="last Reported Accident Date"
                    name="lastReportedAccidentDate"
                    variant="standard"
                    sx={{ width: "200px" }}
                    value={formData.lastReportedAccidentDate}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Second Line Text"
                    name="blackBoxSecondText"
                    sx={{ width: "350px" }}
                    variant="standard"
                    value={formData.blackBoxSecondText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                {/* <Grid xs={12} md={4}>
                  <TextField
                    label="Reportable Accident Free Days"
                    name="reportableAccidentFreeDays"
                    variant="standard"
                    sx={{ width: "200px" }}
                    value={formData.reportableAccidentFreeDays}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid> */}

                <Grid xs={12} md={4}>
                  <TextField
                    label="Third Line Text"
                    name="blackBoxThirdText"
                    sx={{ width: "250px" }}
                    variant="standard"
                    value={formData.blackBoxThirdText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>
                {/* 
                <Grid xs={12} md={4}>
                  <TextField
                    label="Safe Man Hours"
                    name="safeManHours"
                    variant="standard"
                    sx={{ width: "150px" }}
                    value={formData.safeManHours}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid> */}
                <Box width="100%"></Box>
                {/* ------------- Group 3: Department Box ------------- */}

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Department Box Color &nbsp; : - &nbsp;</label>
                    <input
                      type="color"
                      name="departmentManBoxColor"
                      value={formData.departmentManBoxColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Department Box TextColor &nbsp; : - &nbsp;</label>
                    <input
                      type="color"
                      name="departmentBoxTextColor"
                      value={formData.departmentBoxTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Box width="100%"></Box>

                {formData.departmentBoxColors?.map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 90,
                      padding: "8px 5px",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      background: "#fafafa",
                      cursor: "pointer",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        borderRadius: "4px",
                        padding: "3px 5px",
                        bgcolor: color,
                        color: "#111",
                        mb: 1,
                      }}
                    >
                      {deptList[index]?.Department}
                    </Typography>

                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const newColor = e.target.value;
                        const updatedColors = [...formData.departmentBoxColors];
                        updatedColors[index] = newColor;

                        setFormData({
                          ...formData,
                          departmentBoxColors: updatedColors,
                        });
                        const updatedDept = [...deptList];
                        updatedDept[index].color = newColor;
                        setDeptList(updatedDept);
                      }}
                      style={{
                        width: "35px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                        marginTop: "4px",
                      }}
                    />
                  </Box>
                ))}

                <Box
                  sx={{
                    width: 90,
                    padding: "10px 5px",
                    borderRadius: "8px",
                    border: "1px dashed #888",
                    textAlign: "center",
                    background: "#f5f5f5",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      departmentBoxColors: [
                        ...formData.departmentBoxColors,
                        "#000000",
                      ],
                    });

                    setDeptList([
                      ...deptList,
                      {
                        Department: "New...",
                        TotalEmployees: 0,
                        color: "#000000",
                      },
                    ]);
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "green",
                      borderRadius: "5px",
                    }}
                  >
                    + Add
                  </Typography>
                </Box>
                <Box width="100%"></Box>
                {/* ------------- Group 4: Table  ------------- */}

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Table1 Heading BgColor &nbsp; : - &nbsp;</label>
                    <input
                      type="color"
                      name="table1HeadingBgColor"
                      value={formData.table1HeadingBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Table1 Heading Color &nbsp; : - &nbsp;</label>
                    <input
                      type="color"
                      name="table1HeadingTextColor"
                      value={formData.table1HeadingTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Table 2 Heading BgColor &nbsp; : - &nbsp;</label>
                    <input
                      type="color"
                      name="table2HeadingBgColor"
                      value={formData.table2HeadingBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Table 2 Heading Color &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="table2HeadingTextColor"
                      value={formData.table2HeadingTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Table 1 Heading Name"
                    name="table1HeadingText"
                    sx={{ width: "220px" }}
                    variant="standard"
                    value={formData.table1HeadingText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Table 2 Heading Name"
                    name="table2HeadingText"
                    sx={{ width: "220px" }}
                    variant="standard"
                    value={formData.table2HeadingText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Box width="100%"></Box>
                {/* ------------- Group 6: Awards Section ------------- */}

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Awards Section BgColor &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="awardsSectionBgColor"
                      value={formData.awardsSectionBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Awards Section Color &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="awardsSectionTextColor"
                      value={formData.awardsSectionTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Safety Employee BgColor &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="SafetyEmployeeBgColor"
                      value={formData.SafetyEmployeeBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Safety Employee Color &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="SafetyEmployeeTextColor"
                      value={formData.SafetyEmployeeTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Safety Contractor BgColor &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="SafetyContractorBgColor"
                      value={formData.SafetyContractorBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Safety Contractor Color &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="SafetyContractorTextColor"
                      value={formData.SafetyContractorTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Safe Observation BgColor &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="SafetyObservationBgColor"
                      value={formData.SafetyObservationBgColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <label>Safe Observation Color &nbsp; : - &nbsp;</label>{" "}
                    <input
                      type="color"
                      name="SafetyObservationTextColor"
                      value={formData.SafetyObservationTextColor}
                      onChange={handleChange}
                      style={{
                        marginTop: "6px",
                        width: "40px",
                        height: "30px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </Box>
                </Grid>
   <Box width="100%"></Box>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Awards Section Text"
                    name="awardsSectionText"
                    sx={{ width: "250px" }}
                    variant="standard"
                    value={formData.awardsSectionText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <TextField
                    label="Safety Employee Name"
                    name="SafetyEmployeeName"
                    sx={{ width: "230px" }}
                    variant="standard"
                    value={formData.SafetyEmployeeName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Safety Employee Text"
                    name="SafetyEmployeeText"
                    sx={{ width: "250px" }}
                    variant="standard"
                    value={formData.SafetyEmployeeText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <Button variant="outlined" component="label">
                    Upload Image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        uploadImage(e.target.files[0], "SafetyEmployeeImageUrl")
                      }
                    />
                  </Button>

                  {formData.SafetyEmployeeImageUrl && (
                    <img
                      src={formData.SafetyEmployeeImageUrl}
                      alt="preview"
                      style={{
                        marginTop: -35,
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #000",
                      }}
                    />
                  )}
                </Grid>
   <Box width="100%"></Box>

                <Grid xs={12} md={6}>
                  <TextField
                    label="Safety Contractor Name"
                    name="SafetyContractorName"
                    sx={{ width: "230px" }}
                    variant="standard"
                    value={formData.SafetyContractorName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                
                <Grid xs={12} md={4}>
                  <TextField
                    label="Contractor Text"
                    name="SafetyContractorText"
                    sx={{ width: "300px" }}
                    variant="standard"
                    value={formData.SafetyContractorText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                
                <Grid xs={12} md={4}>
                  <Button variant="outlined" component="label">
                    Upload Image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        uploadImage(e.target.files[0], "SafetyContractorImageUrl")
                      }
                    />
                  </Button>

                  {formData.SafetyContractorImageUrl && (
                    <img
                      src={formData.SafetyContractorImageUrl}
                      alt="preview"
                      style={{
                        marginTop: -35,
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #000",
                      }}
                    />
                  )}
                </Grid>

                   <Box width="100%"></Box>

                <Grid xs={12} md={6}>
                  <TextField
                    label="Safety Observation Name"
                    name="SafetyObservationName"
                    sx={{ width: "230px" }}
                    variant="standard"
                    value={formData.SafetyObservationName}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>

                <Grid xs={12} md={4}>
                  <TextField
                    label="Safety Observation Text"
                    name="SafetyObservationText"
                    sx={{ width: "250px" }}
                    variant="standard"
                    value={formData.SafetyObservationText}
                    onChange={handleChange}
                    fullWidth
                  />
                </Grid>


                <Grid xs={12} md={4}>
                  <Button variant="outlined" component="label">
                    Upload Image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        uploadImage(e.target.files[0], "SafetyObservationImageUrl")
                      }
                    />
                  </Button>

                  {formData.SafetyObservationImageUrl && (
                    <img
                      src={formData.SafetyObservationImageUrl}
                      alt="preview"
                      style={{
                        marginTop: -35,
                        width: 120,
                        height: 80,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: "1px solid #000",
                      }}
                    />
                  )}
                </Grid>

   <Box width="100%"></Box>

                {/* -------- Button -------- */}

                <Grid xs={12} md={4}>
                  <TextField
                    label="Admin Passcode"
                    name="passCode"
                    sx={{ width: "250px" }}
                    variant="standard"
                    type={showPass ? "text" : "password"}
                    value={formData.passCode}
                    onChange={handleChange}
                    fullWidth
                    helperText="Enter Admin Passcode"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPass(!showPass)}>
                            {showPass ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Save button */}
                <Grid xs={12} textAlign="center" mt={2}>
                  <Button
                    variant="contained"
                    size="large"
                    type="submit"
                    sx={{
                      paddingX: 3,
                      backgroundColor: "#1976d2",
                      ":hover": { backgroundColor: "#115293" },
                    }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
