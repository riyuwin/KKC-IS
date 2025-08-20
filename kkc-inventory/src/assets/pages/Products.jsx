import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Products() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Products
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Products.</Typography>
      </Paper>
    </Box>
  );
}

export default Products;