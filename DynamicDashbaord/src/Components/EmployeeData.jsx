import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { TableContainer } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

export default function EmployeeData() {
  const [formData, setFormData] = useState({
    Name: "",
    EmpCode: "",
    Department: "",
    Category: "",
  });

  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");
  const [list, setList] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedId) {
      updateEmployee();
      return;
    }

    try {
      await fetch("http://localhost:8000/Employee/NewEmployee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setMessage("Employee Created Successfully!");
      getEmployeeList();
      setOpenForm(false);
      setFormData({
        Name: "",
        EmpCode: "",
        Department: "",
        Category: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Error creating employee");
    }
  };

  const getEmployeeList = async () => {
    try {
      const bodyData = {
        Category: categoryFilter === "ALL" ? "" : categoryFilter,
        Search: searchText,
        Page: page,
        Limit: limit,
      };
      const res = await fetch("http://localhost:8000/Employee/ListDashBoard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (data.status === true) {
        setList(data.items.list || []);
        setPage(data.items.page);
        setTotalPages(data.items.totalPages);
        setNextPage(data.items.nextPage);
        setPrevPage(data.items.prevPage);
      }
    } catch (err) {
      console.error("List API Error:", err);
    }
  };

  useEffect(() => {
    getEmployeeList();
  }, [categoryFilter, searchText, page, limit]);

  const fetchDetail = async (id) => {
    try {
      const res = await fetch("http://localhost:8000/Employee/Detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.status) {
        const emp = data.items;
        setFormData({
          Name: emp.Name,
          EmpCode: emp.EmpCode,
          Department: emp.Department,
          Category: emp.Category,
        });
        setSelectedId(emp.Id);
        setOpenForm(true);
        setMessage("Employee data loaded");
      }
    } catch (err) {
      console.error("Detail Error:", err);
    }
  };

  const updateEmployee = async () => {
    try {
      await fetch("http://localhost:8000/Employee/Update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          id: selectedId.toString(),
        }),
      });

      setMessage("Employee Updated Successfully!");
      getEmployeeList();
      setSelectedId(null);
      setOpenForm(false);

      setFormData({
        Name: "",
        EmpCode: "",
        Department: "",
        Category: "",
      });
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch("http://localhost:8000/Employee/Delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      setMessage("Employee Deleted");
      setOpenConfirm(false);
      getEmployeeList();
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: "auto" }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
        Employee Management
      </Typography>

      {/* ADD NEW EMPLOYEE BUTTON */}
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => {
          setOpenForm(true);
          setSelectedId(null);
          setFormData({
            Name: "",
            EmpCode: "",
            Department: "",
            Category: "",
          });
        }}
      >
        Add New Employee
      </Button>

      {/* FORM OPEN ONLY ON BUTTON OR EDIT */}
      {openForm && (
        <Card sx={{ padding: 1, mb: 2 }}>
          <Typography variant="h6" textAlign="center" mb={1} fontWeight="bold">
            {selectedId ? "Update Employee" : "Add New Employee"}
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="Name"
              label="Employee Name"
              value={formData.Name}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              name="EmpCode"
              label="Employee Code"
              value={formData.EmpCode}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />
            <TextField
              fullWidth
              name="Department"
              label="Department"
              value={formData.Department}
              onChange={handleChange}
              sx={{ mb: 1 }}
            />

            <TextField
              select
              fullWidth
              name="Category"
              label="Category"
              value={formData.Category}
              onChange={handleChange}
              sx={{ mb: 1 }}
            >
              <MenuItem value="FIRST AIDERS">FIRST AIDERS</MenuItem>
              <MenuItem value="FIRE FIGHTERS">FIRE FIGHTERS</MenuItem>
            </TextField>

            <Button
              variant="contained"
              color={selectedId ? "warning" : "primary"}
              fullWidth
              type="submit"
              startIcon={selectedId ? <EditIcon /> : null}
            >
              {selectedId ? "Update Employee" : "Add Employee"}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
              onClick={() => setOpenForm(false)}
            >
              Close
            </Button>
          </form>
        </Card>
      )}

      {/* EMPLOYEE LIST SECTION */}
      <Card sx={{ padding: 2, mb: 1 }}>
        <Typography variant="h6" mb={1} textAlign="center" fontWeight="bold">
          Employee List
        </Typography>

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            select
            label="Category"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            fullWidth
          >
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="FIRST AIDERS">FIRST AIDERS</MenuItem>
            <MenuItem value="FIRE FIGHTERS">FIRE FIGHTERS</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Search By Name , Department , EmpCode"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
          />
        </Box>

        <Paper>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: 300, overflowY: "auto" }}
          >
            <Table
              sx={{
                "& td": { padding: "2px !important" },
                "& th": { padding: "4px !important" },
              }}
            >
              <TableHead sx={{ background: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>S.N.</TableCell>
                  <TableCell sx={{ color: "white" }}>Name</TableCell>
                  <TableCell sx={{ color: "white" }}>Emp Code</TableCell>
                  <TableCell sx={{ color: "white" }}>Department</TableCell>
                  <TableCell sx={{ color: "white" }}>Category</TableCell>
                  <TableCell sx={{ color: "white" }}>Edit</TableCell>
                  <TableCell sx={{ color: "white" }}>Delete</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {list.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  list.map((emp, index) => (
                    <TableRow key={emp.Id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{emp.Name}</TableCell>
                      <TableCell>{emp.EmpCode}</TableCell>
                      <TableCell>{emp.Department}</TableCell>
                      <TableCell>{emp.Category}</TableCell>

                      <TableCell>
                        <IconButton onClick={() => fetchDetail(emp.Id)}>
                          <EditIcon color="primary" />
                        </IconButton>
                      </TableCell>

                      <TableCell>
                        <IconButton
                          onClick={() => {
                            setDeleteId(emp.Id);
                            setOpenConfirm(true);
                          }}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            disabled={!prevPage}
            onClick={() => setPage(prevPage)}
            variant="outlined"
          >
            Previous
          </Button>

          <Typography>
            Page {page} of {totalPages}
          </Typography>

          <Typography>
            Showing {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, list.length + (page - 1) * limit)}
          </Typography>

          <Button
            disabled={!nextPage}
            onClick={() => setPage(nextPage)}
            variant="outlined"
          >
            Next
          </Button>

          <TextField
            select
            label="Rows"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            sx={{ width: 70 }}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
            <MenuItem value={500}>500</MenuItem>
            <MenuItem value={1000}>1000</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Are you sure you want to delete?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={message !== ""}
        autoHideDuration={2000}
        onClose={() => setMessage("")}
      >
        <Alert severity="success">{message}</Alert>
      </Snackbar>
    </Box>
  );
}
