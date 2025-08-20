import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Returns() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Returns
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Returns.</Typography>
      </Paper>
    </Box>
  );
}

export default Returns;