import React, { useState } from "react";
import { Box, Grid, Paper, Typography, TextField, Button, InputAdornment, useMediaQuery } from "@mui/material";
import { MdPerson, MdLock } from "react-icons/md";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import bgImage from "../../images/login-bg.jpg";
import logo from "../../images/kkc-logo.png";


const LayoutTextField = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-root": {
        borderRadius: 10,
        backgroundColor: "#FFFFFF",
        transition: "box-shadow 0.2s ease, transform 0.05s ease",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#000000ff",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#BDBDBD",
    },
    "& .MuiInputBase-root.Mui-focused": {
        boxShadow: "0 0 0 3px rgba(250, 113, 1, 0.15)",
    },
}));

export default function Login() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [form, setForm] = useState({ username: "", password: "" });

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Login:", form);
    };

    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                width: "100%",
                height: "100dvh",
                overflow: "hidden",
                fontFamily: "Poppins, sans-serif",

                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <Grid
                container
                sx={{
                    height: "100%",
                    backdropFilter: isMobile ? "none" : "saturate(110%)",
                }}
            >
                {/* KKC Logo on the Left --> Centered on mobile */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        height: isMobile ? "45%" : "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: { xs: "center", md: "flex-end" },
                        pr: { md: 4, lg: 6 },
                        pl: { md: 6, lg: 16 },
                    }}
                >
                    <Box
                        component="img"
                        src={logo}
                        alt="KKC Logo"
                        sx={{
                            mt: isMobile ? -16 : 0,
                            width: isMobile ? 400 : 600,
                            height: "auto",
                            maxWidth: "90%",
                            filter: "drop-shadow(0px 8px 24px rgba(0,0,0,0.35))",
                        }}
                    />
                </Grid>

                {/* Right: Login Card --> Centered on Mobile */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        height: isMobile ? "55%" : "100%",
                        display: "flex",
                        alignItems: "center",
                        mt: isMobile ? -18 : 0,
                        ml: 3,
                        justifyContent: { xs: "center", md: "flex-start" },
                        pl: { md: 4, lg: 6 },
                        pr: { xs: 3, sm: 4, md: 6 },
                    }}
                >
                    <Paper
                        elevation={8}
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            width: "100%",
                            maxWidth: 480,
                            borderRadius: 3,
                            p: { xs: 3, sm: 4 },
                            bgcolor: "#FFFFFF",
                            boxShadow:
                                "0px 10px 25px rgba(0,0,0,0.18), 0px 2px 6px rgba(0,0,0,0.08)",
                            overflowY: "auto",
                            maxHeight: isMobile ? "80vh" : "unset",
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}
                        >
                            KKC Inventory System
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                mb: 3,
                                mt: 3,
                                textAlign: "center",
                                fontStyle: "italic",
                                color: "#616161",
                            }}
                        >
                            Please log in to access the inventory system
                        </Typography>

                        <Typography variant="subtitle2" sx={{ mb: 1, color: "black" }}>
                            Username
                        </Typography>
                        <LayoutTextField
                            fullWidth
                            name="username"
                            placeholder="Enter your username"
                            value={form.username}
                            onChange={handleChange}
                            margin="dense"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box sx={{ color: "#9E9E9E" }}>
                                            <MdPerson />
                                        </Box>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: "black" }}>
                            Password
                        </Typography>
                        <LayoutTextField
                            fullWidth
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            margin="dense"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Box sx={{ color: "#9E9E9E" }}>
                                            <MdLock />
                                        </Box>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3,
                                py: 1.2,
                                borderRadius: 10,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "1rem",
                                bgcolor: "#E67600",
                                "&:hover": { bgcolor: "#FA8201" },
                            }}
                        >
                            Log In
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
