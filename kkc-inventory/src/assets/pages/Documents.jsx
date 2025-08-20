import React from "react";
import { Box, Typography, Paper } from "@mui/material";

function Documents() {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        Documents
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Welcome to KKC Inventory Documents.</Typography>
      </Paper>
    </Box>
  );
}

export default Documents;