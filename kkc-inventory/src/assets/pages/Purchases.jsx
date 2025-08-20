import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Purchases() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Purchases
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Purchases.</Typography>
      </Paper>
    </Box>
  );
}

export default Purchases;