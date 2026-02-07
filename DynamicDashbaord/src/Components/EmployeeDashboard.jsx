import {
  Box,
  Card,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import React, { useEffect, useState } from "react";
import ReusableTable from "./ReusableTable";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

export default function EmployeeDashboard() {
  const [dateTime, setDateTime] = useState({ date: "", time: "" });
  const [departments, setDepartments] = useState([]);
  const [firstAiderRows, setFirstAiderRows] = useState([]);
  const [fireFighterRows, setFireFighterRows] = useState([]);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [departmentColors, setDepartmentColors] = useState([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [safeManHours, setSafeManHours] = useState(0);
  const [accidentFreeDuration, setAccidentFreeDuration] = useState({
    years: 0,
    months: 0,
    days: 0,
    hours: 0
  });
  useEffect(() => {
    fetch(`http://localhost:8000/Safety/Setting/Get`)
      .then((res) => res.json())
      .then((data) => {
        const companyDetail = data.items;
        if (companyDetail?.bodyBgColor) {
          document.body.style.backgroundColor = companyDetail?.bodyBgColor;
        }
        setCompanyDetail(companyDetail);

        // const updateSafeManHours = () => {
          const duration = calculateAccidentFreeDuration(
            companyDetail.lastReportedAccidentDate,
            "10:00"
          );

          const hours = calculateSafeManHours(
            companyDetail.lastReportedAccidentDate
          );

          setAccidentFreeDuration(duration);
          setSafeManHours(hours);
        // }
        // updateSafeManHours();

        // const interval = setInterval(updateSafeManHours, 60 * 60 * 1000);

        const departmentColors = companyDetail?.departmentBoxColors
          ? JSON.parse(companyDetail?.departmentBoxColors)
          : [];
        // console.log("departmentColors--", departmentColors);
        setDepartmentColors(departmentColors);
      });
  }, []);

  const calculateAccidentFreeDuration = (dateString, timeString = "10:00") => {
    // dateString: DD/MM/YYYY
    const [day, month, year] = dateString.split("/");
    const [hours, minutes] = timeString.split(":");

    const startDate = new Date(
      year,
      month - 1,
      day,
      hours,
      minutes,
      0
    );

    const now = new Date();

    let years = now.getFullYear() - startDate.getFullYear();
    let months = now.getMonth() - startDate.getMonth();
    let days = now.getDate() - startDate.getDate();
    let hrs = now.getHours() - startDate.getHours();

    if (hrs < 0) {
      hrs += 24;
      days--;
    }

    if (days < 0) {
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    return { years, months, days, hours: hrs };
  };

  const calculateSafeManHours = (dateString) => {
  // dateString format: DD/MM/YYYY
  const [day, month, year] = dateString.split("/");

  // Start from 10:00 AM
  const startDate = new Date(
    year,
    month - 1,
    day,
    10,
    0,
    0
  );

  const now = new Date();

  const diffMs = now - startDate;

  if (diffMs <= 0) return 0;

  // completed hours only
  return Math.floor(diffMs / (1000 * 60 * 60));
};


  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDate = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(now);
      const formattedTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);

      setDateTime({ date: formattedDate, time: formattedTime });
    };
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getDepartmentList = async () => {
    try {
      const res = await fetch("http://localhost:8000/Employee/DepartmentList");
      const data = await res.json();
      if (data.status === true) {
        const deptList = data.items.list.map((d) => ({
          name: d.Department,
          count: d.TotalEmployees,
        }));
        // console.log("totalEmployees", data.items.totalEmployees);
        setDepartments(deptList);
        setTotalEmployees(data.items.totalEmployees);
      }
    } catch (error) {
      console.log("Department API error:", error);
    }
  };

  const getTeamList = async (teamName, setterFunction) => {
    try {
      const res = await fetch("http://localhost:8000/Employee/Table/List", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Category: teamName }),
      });
      const data = await res.json();
      if (data.status === true) {
        const teamRows = data.items.list.map((emp, index) => ({
          id: index + 1,
          name: emp.Name,
          role: emp.EmpCode,
          dept: emp.Department,
        }));
        setterFunction(teamRows);
      }
    } catch (error) {
      console.log(teamName, "List API error:", error);
    }
  };

  useEffect(() => {
    const refreshAllData = () => {
      getDepartmentList();
      getTeamList("FIRST AIDERS", setFirstAiderRows);
      getTeamList("FIRE FIGHTERS", setFireFighterRows);
    };
    refreshAllData();
    const interval = setInterval(() => {
      refreshAllData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    { id: "id", label: "S.N.", minWidth: 70 },
    { id: "name", label: "Name", minWidth: 150 },
    { id: "role", label: "Code", minWidth: 120 },
    { id: "dept", label: "Department", minWidth: 150 },
  ];

  return (
    <Box>
      <Typography
        variant="h3"
        fontWeight="bold"
        color={companyDetail?.companyTextColor}
        textAlign="center"
      >
        {companyDetail?.companyName}
      </Typography>
      <Typography variant="h5" color={companyDetail?.boardTitleTextColor} textAlign="center">
        {companyDetail?.boardTitle}
      </Typography>

      <Box
        sx={{
          gridColumn: "1 / -1",
          display: "flex",
          width: "220px",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1px 10px",
          background: "#01070eff",
          color: "white",
          borderRadius: "5px",
          fontSize: "18px",
          whiteSpace: "nowrap",
          fontWeight: "bold",
          margin: "0 auto",
        }}
      >
        <span>Total Head Count</span>
        <span>{totalEmployees}</span>
      </Box>
      <Box className="dashboard-wrapper">
        <Box
          className="black-box"
          sx={{
            flex: 1,
            background: companyDetail?.blackBoxBgColor,
            color: companyDetail?.blackBoxTextColor,
            padding: 1,
            flexBasis: "40.33%",
            maxWidth: "30.33%",
            width: { xs: "100%", md: "50%" },
            height: "180px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography
            fontSize={16}
            display="flex"
             component="div"
            justifyContent="space-between"
          >
            <div>
              DATE : <span style={{ color: companyDetail?.blackBoxTextColor }}>{dateTime.date}</span>
            </div>
            <div>
              TIME : <span style={{ color: companyDetail?.blackBoxTextColor }}>{dateTime.time}</span>
            </div>
          </Typography>
          <Typography mt={1} fontSize={16} fontWeight="bold" textAlign="center">
            <u>{companyDetail?.blackBoxCenterText}</u>
          </Typography>
          <Typography
            fontSize={16}
            mt={1}
            display="flex"
            justifyContent="space-between"
          >
            {companyDetail?.blackBoxFirstText} :
            <span style={{ color: companyDetail?.blackBoxTextColor }}>
              {companyDetail?.lastReportedAccidentDate}
            </span>
          </Typography>
          <Typography
            fontSize={16}
            mt={1}
            display="flex"
            justifyContent="space-between"
          >
            {companyDetail?.blackBoxSecondText} :
            {/* TOTAL REPORTABLE ACCIDENT FREE DAYS : */}
            <span style={{ color: companyDetail?.blackBoxTextColor }}>
              {/* {companyDetail?.reportableAccidentFreeDays} */}

              {accidentFreeDuration.years} Years{" "}
              {accidentFreeDuration.months} Months{" "}
              {accidentFreeDuration.days} Days{" "}
            </span>
          </Typography>
          <Typography
            fontSize={16}
            mt={1}
            display="flex"
            justifyContent="space-between"
          >
            {companyDetail?.blackBoxThirdText} :{/* TOTAL SAFE MAN HOURS : */}
            <span style={{ color: companyDetail?.blackBoxTextColor }}>
              {safeManHours}
            </span>
          </Typography>
        </Box>

        <Box
          className="department-summary-box"
          sx={{
            flex: 1,
            width: { xs: "100%", md: "50%" },
            height: "180px",
            overflowY: "auto",
            flexBasis: "66.66%",
            maxWidth: "66.66%",
            overflowX: "hidden",
            p: 1,
            borderRadius: "5px",
            background: `${companyDetail?.departmentManBoxColor}`,
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box className="department-summary-grid">
            {/* ⭐ FIRST ROW FIXED → Total Head Count */}


            {/* ⭐ BELOW NORMAL DEPARTMENTS LIST */}
            {departments.map((d, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  width: "140px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1px 10px",
                  background: departmentColors.length
                    ? departmentColors[index % departmentColors.length]
                    : "#318ce7",
                  borderRadius: "5px",
                  fontSize: "20px",
                  whiteSpace: "nowrap",
                  color: `${companyDetail?.departmentBoxTextColor}`,
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.name}
                </span>
                <strong>{d.count}</strong>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* second table lines */}

      <Grid
        container
        spacing={2}
        mt={1}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "2fr 2fr 1fr",
          },
          gap: 2,
        }}
      >
        <Grid>
          <ReusableTable
            columns={columns}
            rows={fireFighterRows}
            tableName={companyDetail?.table2HeadingText}
            tableHeadColor={companyDetail?.table2HeadingTextColor}
            tableHeadBgColor={companyDetail?.table2HeadingBgColor}
          />
        </Grid>
        <Grid>
          <ReusableTable
            columns={columns}
            rows={firstAiderRows}
            tableName={companyDetail?.table1HeadingText}
            tableHeadColor={companyDetail?.table1HeadingTextColor}
            tableHeadBgColor={companyDetail?.table1HeadingBgColor}
          />
        </Grid>
        <Grid>
          <Card
            sx={{
              padding: 1,
              background: companyDetail?.SafetyAwardsBoxBgColor,
              borderRadius: "5px",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              height: "600px",              // this line 330px 
            }}
          >
            <Box
              sx={{
                background: companyDetail?.awardsSectionBgColor,
                padding: "10px",
                color: companyDetail?.awardsSectionTextColor,
                textAlign: "center",
                borderRadius: "5px",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "5px",
                fontSize: "23PX"
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 20 }} />
              <span>{companyDetail?.awardsSectionText}</span>
            </Box>


            <Box
              sx={{
                padding: "10px",
                border: "1px solid #000000ff",
                borderRadius: "5px",
                fontSize: "16px",
                color: companyDetail?.SafetyEmployeeTextColor,
                background: companyDetail?.SafetyEmployeeBgColor,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={companyDetail?.SafetyEmployeeImageUrl}
                style={{
                  width: "200px",
                  height: "120px",
                  // borderRadius: "50%",
                  borderRadius: "50%",          // <-- Rounded corners
                  border: "1px solid #000",
                  objectFit: "cover",
                  // borderRadius:"1px solid black"
                }}
                alt="employee"
              />

              {companyDetail?.SafetyEmployeeText}
              <b>{companyDetail?.SafetyEmployeeName}</b>
            </Box>


            <Box
              sx={{
                padding: "10px",
                border: "1px solid #000000ff",
                borderRadius: "5px",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: companyDetail?.SafetyContractorTextColor,
                background: companyDetail?.SafetyContractorBgColor,
              }}
            >
              <img
                src={companyDetail?.SafetyContractorImageUrl}
                style={{
                  width: "200px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "1px solid #000",
                  objectFit: "cover",
                }}
                alt="employee"
              />
              {companyDetail?.SafetyContractorText}
              <b>{companyDetail?.SafetyContractorName}</b>
            </Box>


            <Box
              sx={{
                padding: "10px",
                border: "1px solid #000000ff",
                borderRadius: "5px",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: companyDetail?.SafetyObservationTextColor,
                background: companyDetail?.SafetyObservationBgColor,
              }}
            >
              <img
                src={companyDetail?.SafetyObservationImageUrl}
                style={{
                  width: "200px",
                  height: "120px",
                  borderRadius: "50%",
                  border: "1px solid #000",
                  objectFit: "cover",
                }}
                alt="employee"
              />
              {companyDetail?.SafetyObservationText}
              <b>{companyDetail?.SafetyObservationName}</b>
            </Box>


          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}