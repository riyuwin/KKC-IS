import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Reports() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Reports
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Reports.</Typography>
      </Paper>
    </Box>
  );
}

export default Reports;