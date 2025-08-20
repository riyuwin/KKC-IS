import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Sales() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Sales
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Sales.</Typography>
      </Paper>
    </Box>
  );
}

export default Sales;