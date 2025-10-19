import React, { createContext, useMemo, useState, useEffect, useContext } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const STORAGE_KEY = "kkc-theme-mode";
const ColorModeContext = createContext({ mode: "light", toggleColorMode: () => {} });
export const useColorMode = () => useContext(ColorModeContext);

export default function ColorModeProvider({ children }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") setMode(saved);
  }, []);
  const toggleColorMode = () =>
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#FA8201" },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#0f0f10",
            paper: mode === "light" ? "#ffffff" : "#151517",
          },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiAppBar: { styleOverrides: { root: { boxShadow: "none", borderBottom: "1px solid rgba(0,0,0,0.08)" } } },
          MuiDrawer: { styleOverrides: { paper: { borderRight: "none" } } },
        },
        typography: { fontFamily: "Poppins, sans-serif" },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
