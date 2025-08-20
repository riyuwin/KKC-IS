import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Dashboard() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Dashboard
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Dashboard.</Typography>
      </Paper>
    </Box>
  );
}

export default Dashboard;
