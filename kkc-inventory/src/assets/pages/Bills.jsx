import { useState } from "react";
import { Box, Paper, Typography, Tabs, Tab, Divider } from "@mui/material";
import ManagePayables from "../components/ManagePayablesTable";
import ManageDueDatesTable from "../components/ManageDueDatesTable";
import DueDatesFilter from "../components/DueDatesFilter";

// A11y Helpers for Tabs
function a11yProps(index) {
  return { id: `accounts-tab-${index}`, "aria-controls": `accounts-tabpanel-${index}` };
}

function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`accounts-tabpanel-${index}`} aria-labelledby={`accounts-tab-${index}`} sx={{ pt: 2 }}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

function Bills() {
  const [tab, setTab] = useState(0);
  const [stockStatus, setStockStatus] = useState(""); // selected year
  const [dataToExport, setDataToExport] = useState([]); // table data to export

  /* console.table(dataToExport); */

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5 }}>
        Bills
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary" centered>
          <Tab label="Manage Payables" {...a11yProps(0)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
          <Tab label="Due Dates" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
        </Tabs>
      </Box>

      {/* ✅ Pass correct props */}
      {tab === 1 && (
        <DueDatesFilter
          stockStatus={stockStatus}
          onStatusChange={setStockStatus}
          dataToExport={dataToExport}
          tab={tab}
        />
      )}

      <Divider sx={{ mt: 6 }} />

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mt: 0,
          borderRadius: 2,
          bgcolor: "transparent",
          border: "none",
        }}
      >
        {tab === 0 ? (
          <ManagePayables stockStatus={stockStatus} setDataToExport={setDataToExport} />
        ) : (
          <ManageDueDatesTable stockStatus={stockStatus} setDataToExport={setDataToExport} />
        )}
      </Paper>
    </Box>
  );
}

export default Bills;
