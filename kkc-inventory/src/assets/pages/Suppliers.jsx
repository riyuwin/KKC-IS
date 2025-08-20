import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Suppliers() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Suppliers
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Suppliers.</Typography>
      </Paper>
    </Box>
  );
}

export default Suppliers;