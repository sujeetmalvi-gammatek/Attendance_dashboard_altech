import EmployeeDashboard from "./Components/EmployeeDashboard.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import EmployeeData from "./Components/EmployeeData.jsx";
import Setting from "./Components/Setting.jsx";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
        <div>
          <Routes>
            vvvvcv
            <Route path="/" element={<EmployeeDashboard />} />
            <Route path="/EmployeeData" element={<EmployeeData />} />
            <Route path="/Settings" element={<Setting />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </BrowserRouter>
    </>
  );
}

export default App;
