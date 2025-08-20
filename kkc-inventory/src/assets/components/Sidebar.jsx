import React, { useMemo, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, IconButton, useMediaQuery } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";

// Icons
import { MdDashboard } from "react-icons/md";
import { MdShoppingCart, MdAssessment, MdDescription, MdPeople } from "react-icons/md";
import { TbPackages } from "react-icons/tb";
import { IoReceipt } from "react-icons/io5";
import { BiArrowBack } from "react-icons/bi";
import { MdLocalShipping } from "react-icons/md";
import { MdReceiptLong } from "react-icons/md";

import logo from '../../images/kkc-logo.png';

// Menu items
const allItems = [
  { label: "Dashboard", to: "/", icon: <MdDashboard size={20} /> },
  { label: "Products", to: "/products", icon: <TbPackages size={20} /> },
  { label: "Purchases", to: "/purchases", icon: <MdShoppingCart size={20} /> },
  { label: "Sales", to: "/sales", icon: <IoReceipt size={20} /> },
  { label: "Returns", to: "/returns", icon: <BiArrowBack size={20} /> },
  { label: "Suppliers", to: "/suppliers", icon: <MdLocalShipping size={20} /> },
  { label: "Reports", to: "/reports", icon: <MdAssessment size={20} /> },
  { label: "Documents", to: "/documents", icon: <MdDescription size={20} /> },
  { label: "Bills", to: "/bills", icon: <MdReceiptLong size={20} /> },
  { label: "Accounts", to: "/accounts", icon: <MdPeople size={20} />, adminOnly: true },
];

function Sidebar({ drawerWidth = 260, accountType = "admin" }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo(() => {
    return accountType === "warehouse"
      ? allItems.filter(i => i.label !== "Accounts")
      : allItems;
  }, [accountType]);

  const drawerContent = (
    <Box
      sx={{
        fontFamily: "Poppins, sans-serif",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#757575",
        color: "#FFFFFF",
      }}
    >
      {/* Logo */}
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ width: isMobile ? 130 : 200, height: isMobile ? 130 : 200 }}
        />
      </Toolbar>

      {/* Menu */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List disablePadding>
          {items.map(item => {
            const selected = location.pathname === item.to;
            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={selected}
                sx={{
                  py: 1.2,
                  "& .MuiListItemIcon-root": { color: "#FFFFFF", minWidth: 40 },
                  color: selected ? "#FAFAFA" : "#FFFFFF",
                  bgcolor: selected ? "#1A1A1A" : "transparent", // hex instead of rgba
                  "&:hover": {
                    bgcolor: "#6B6B6B",
                  },
                  borderLeft: selected ? "4px solid #FA8201" : "4px solid transparent",
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: 2, textAlign: "center", fontSize: "0.75rem", opacity: 0.8, fontWeight: 300 }}>
        © {new Date().getFullYear()} KKC
      </Box>
    </Box>
  );

  return (
    <>
      {/* Hamburger Menu */}
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: 2000,
            color: "#757575",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;
