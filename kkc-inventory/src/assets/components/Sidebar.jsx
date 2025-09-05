import React, { useEffect, useMemo, useState } from "react";
import { useLocation, Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, IconButton, useMediaQuery, Divider } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";
import { MdDashboard, MdShoppingCart, MdAssessment, MdDescription, MdPeople, MdLocalShipping, MdReceiptLong, MdLogout } from "react-icons/md";
import { TbPackages } from "react-icons/tb";
import { IoReceipt } from "react-icons/io5";
import { BiArrowBack } from "react-icons/bi";
import logo from "../../images/kkc-logo.png";
import { Logout, ValidateUserLoggedIn } from "../logics/auth/ValidateLogin";


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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Screen sizes (to use the size efficiently sa mga styling)
  const isShort = useMediaQuery("(max-height: 820px)");
  const isTiny  = useMediaQuery("(max-height: 700px)");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const user = await ValidateUserLoggedIn(navigate);
      if (user) {
        console.log("User from session:", user);
        setUserDetails(user);
      }
    };
    checkSession();
  }, [navigate]);

  const items = useMemo(() => {
    if (!userDetails) return allItems; // fallback until session is loaded

    return userDetails.role.toLowerCase() === "warehouse"
      ? allItems.filter((i) => i.label !== "Accounts")
      : allItems;
  }, [userDetails]);


  const swalConfirm = async (title, text) => {
    const res = await Swal.fire({
      heightAuto: false,
      icon: "question",
      title,
      text,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      reverseButtons: true,
      focusCancel: true,
    });
    return res.isConfirmed;
  };

  const handleLogout = async () => {
      const ok = await swalConfirm("Logout?", "Are you sure you want to logout?");
      if (!ok) return;

      try {
          await Logout();
      } finally {
          if (isMobile) setMobileOpen(false);
          navigate("/login", { replace: true });
      }
  };


  // Scales based on height
  const logoSize = isTiny
    ? (isMobile ? 70 : 90)
    : isShort
    ? (isMobile ? 96 : 200)
    : (isMobile ? 120 : 180);

  const topPadY   = isTiny ? 0.5 : isShort ? 1 : 2;
  const itemPy    = isTiny ? 0.65 : isShort ? 1.0 : 1.1;
  const iconMinW  = isTiny ? 34 : isShort ? 36 : 40;
  const labelSize = isTiny ? "0.93rem" : isShort ? "0.95rem" : "1rem";
  const dividerMy = isTiny ? 0.5 : isShort ? 0.75 : 1;
  const footerFs  = isTiny ? "0.68rem" : "0.75rem";
  const footerPy  = isTiny ? 0.75 : 1.25;

  const drawerContent = (
    <Box
      sx={{
        fontFamily: "Poppins, sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#757575",
        color: "#FFFFFF",
        overflow: "hidden", // no scroll
      }}
    >
      {/* Logo (compact toolbar) */}
      <Toolbar
        disableGutters
        sx={{
          justifyContent: "center",
          minHeight: 0,
          py: topPadY,
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{ width: logoSize, height: logoSize, objectFit: "contain" }}
        />
      </Toolbar>

      {/* Menu (no scroll) */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <List disablePadding dense={isShort || isTiny}>
          {items.map((item) => {
            const selected = location.pathname === item.to;
            return (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                selected={selected}
                sx={{
                  py: itemPy,
                  "& .MuiListItemIcon-root": { color: "#FFFFFF", minWidth: iconMinW },
                  color: selected ? "#FAFAFA" : "#FFFFFF",
                  bgcolor: selected ? "#1A1A1A" : "transparent",
                  "&:hover": { bgcolor: "#6B6B6B" },
                  borderLeft: selected ? "4px solid #FA8201" : "4px solid transparent",
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: labelSize }}
                />
              </ListItemButton>
            );
          })}

          {/* Logout (below Accounts) */}
          <Divider sx={{ my: dividerMy, borderColor: "rgba(255,255,255,0.2)" }} />
          <ListItemButton
            onClick={handleLogout}
            sx={{
              py: itemPy,
              "& .MuiListItemIcon-root": { color: "#FFFFFF", minWidth: iconMinW },
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#6B6B6B" },
            }}
          >
            <ListItemIcon>
              <MdLogout size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{ fontSize: labelSize }}
            />
          </ListItemButton>
        </List>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: footerPy,
          px: 2,
          textAlign: "center",
          fontSize: footerFs,
          opacity: 0.8,
          fontWeight: 300,
        }}
      >
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
          sx={{ position: "fixed", top: 10, left: 10, zIndex: 2000, color: "#757575" }}
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
            height: "100vh",
            overflow: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;
