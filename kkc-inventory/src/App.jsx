import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./assets/components/Sidebar";
import Topbar from "./assets/components/Topbar";
import ColorModeProvider from "./assets/components/ColorModeProvider";

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
import CreatePurchase from "./assets/pages/CreatePurchase";
import CreateProduct from "./assets/pages/CreateProducts";
import CreateSales from "./assets/pages/CreateSales";

const ACCOUNT_TYPE = "admin";
const DRAWER_WIDTH = 260;

function AppShell() {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", color: "text.primary" }}>
      {!isLogin && (
        <>
          <Topbar
            drawerWidth={DRAWER_WIDTH}
            onOpenMobile={() => setMobileOpen(true)}
          />
          <Sidebar
            drawerWidth={DRAWER_WIDTH}
            accountType={ACCOUNT_TYPE}
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
          />
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: isLogin ? 0 : 5,
          width: "100%",
          minHeight: "100vh",
          // AppBar spacer
          ...(isLogin ? {} : { pt: { xs: 10, md: 12 } }),
        }}
      >
        {!isLogin && <Toolbar sx={{ display: "none" }} />} {/* keeps layout stable */}
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
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/purchases/new" element={<CreatePurchase />} />
          <Route path="/products/new" element={<CreateProduct />} />
          <Route path="/sales/new" element={<CreateSales />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ColorModeProvider>
      <AppShell />
    </ColorModeProvider>
  );
}
