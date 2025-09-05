import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";
import Sidebar from "./assets/components/Sidebar";
import Dashboard from "./assets/pages/Dashboard";
import Products from "./assets/pages/Products";
import Purchases from "./assets/pages/Purchases";
import Sales from "./assets/pages/Sales";
import Returns from "./assets/pages/Returns";
import Suppliers from "./assets/pages/Suppliers";
import Reports from "./assets/pages/Reports";
import Documents from "./assets/pages/Documents";
import Bills from "./assets/pages/Bills";
import Accounts from "./assets/pages/Accounts";
import Login from "./assets/pages/Login"; 
import { ValidateUserLoggedIn } from "./assets/logics/auth/ValidateLogin";

// Set the account type here for now: "admin" | "warehouse"
const ACCOUNT_TYPE = "admin"; // or warehouse. lalagyan ng logic 

const DRAWER_WIDTH = 260;

function App() {
  const location = useLocation();
  const isLogin = location.pathname === "/login"; 

  

  return (
    <>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {!isLogin && (
          <Sidebar drawerWidth={DRAWER_WIDTH} accountType={ACCOUNT_TYPE} />
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: isLogin ? 0 : 5,
            bgcolor: "#f5f5f5",
            minHeight: "100vh",
          }}
        >
          {!isLogin && <Toolbar />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/bills" element={<Bills />} />
            {/* Accounts only meaningful for admin, but routing can exist safely */}
            <Route path="/accounts" element={<Accounts />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App;