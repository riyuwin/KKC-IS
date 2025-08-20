import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Accounts() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Accounts
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Accounts.</Typography>
      </Paper>
    </Box>
  );
}

export default Accounts;