import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Bills() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Bills
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Bills.</Typography>
      </Paper>
    </Box>
  );
}

export default Bills;