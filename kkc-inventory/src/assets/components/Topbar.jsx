import React, { useEffect, useState } from "react";
import { AppBar, Toolbar, IconButton, Box, Tooltip, Avatar, Menu, MenuItem, Typography, Divider } from "@mui/material";
import { Menu as MenuIcon, Brightness4, Brightness7 } from "@mui/icons-material";
import { useTheme, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "./ColorModeProvider";
import { Logout, ValidateUserLoggedIn } from "../logics/auth/ValidateLogin";
import logo from "../../images/kkc-logo.png";

export default function Topbar({ drawerWidth = 260, onOpenMobile }) {
    const theme = useTheme();
    const navigate = useNavigate();
    const { mode, toggleColorMode } = useColorMode();
    const [anchorEl, setAnchorEl] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            const u = await ValidateUserLoggedIn(navigate);
            if (u) setUser(u);
        })();
    }, [navigate]);

    const open = Boolean(anchorEl);
    const handleMenu = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    const handleLogout = async () => { try { await Logout(); } finally { navigate("/login", { replace: true }); } };

    const initials = (v) => {
        if (!v) return "U";
        const s = String(v).trim();
        const parts = s.split(/\s+/);
        return (parts[0][0] + (parts[1]?.[0] || s[1] || "")).toUpperCase();
    };

    // Same color as sidebar
    const barBg = theme.palette.mode === "dark" ? theme.palette.grey[900] : "#757575";
    const pillBg = alpha("#fff", 0.15);
    const pillHover = alpha("#fff", 0.25);

    const TOOLBAR_H = 64;
    const LOGO_MAX_H = 200; 

    return (
        <AppBar
            position="fixed"
            color="inherit"
            elevation={0}
            sx={{
                width: "100%",
                ml: 0,
                bgcolor: barBg,
                color: "#fff",

                boxShadow: "none !important",
                borderBottom: "0 !important",
                outline: "none",
                backgroundImage: "none",
                "&::before,&::after": { display: "none" },

                zIndex: { xs: theme.zIndex.appBar, md: theme.zIndex.drawer + 1 },
            }}
        >
            <Toolbar sx={{ minHeight: TOOLBAR_H, height: TOOLBAR_H, px: 0 }}>
                {/* Mobile hamburger */}
                <IconButton
                    onClick={onOpenMobile}
                    sx={{
                        ml: 1,
                        mr: 1,
                        display: { md: "none" },
                        color: "#fff",
                        bgcolor: pillBg,
                        "&:hover": { bgcolor: pillHover },
                    }}
                    aria-label="Open menu"
                >
                    <MenuIcon />
                </IconButton>

                {/* Desktop logo area aligned to drawer width */}
                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        width: `${drawerWidth}px`,
                        pl: 2,
                        pr: 1,
                        height: TOOLBAR_H,  
                        overflow: "visible",
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="KKC"
                        onClick={() => navigate("/")}
                        sx={{
                            mt: 8,
                            ml: -3,
                            height: LOGO_MAX_H,
                            maxHeight: LOGO_MAX_H,
                            width: "auto",
                            cursor: "pointer",
                            userSelect: "none",
                            display: "block",
                        }}
                    />
                </Box>

                {/* Title */}
                <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
                    KKC Inventory System
                </Typography>

                <Box sx={{ flexGrow: 1 }} />

                {/* Theme toggle */}
                <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                    <IconButton
                        onClick={toggleColorMode}
                        aria-label="Toggle theme"
                        sx={{ mr: 1, color: "#fff" }}
                    >
                        {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Tooltip>

                {/* Profile */}
                <Tooltip title="Account">
                    <IconButton
                        onClick={handleMenu}
                        aria-controls={open ? "acct-menu" : undefined}
                        aria-haspopup="true"
                        sx={{ color: "#fff" }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                bgcolor: theme.palette.primary.main,
                                color: "#fff",
                                border: `2px solid ${alpha("#fff", 0.25)}`,
                            }}
                        >
                            {initials(user?.name || user?.email)}
                        </Avatar>
                    </IconButton>
                </Tooltip>

                <Menu
                    id="acct-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2">{user?.name || "User"}</Typography>
                        <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => { handleClose(); navigate("/accounts"); }}>Profile</MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate("/documents"); }}>Settings</MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
