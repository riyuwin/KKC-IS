import { useEffect, useState } from "react";
import { Box, Paper, Typography, Tabs, Tab, Stack, Button, Divider } from "@mui/material";
import SearchBar from "../components/SearchBar";
import { MdSearch } from "react-icons/md";
import DurationFilter from "../components/DurationFilter";
import SalesReportTable from "../components/SalesReportTable";
import PurchaseReportTable from "../components/PurchaseReportTable";
import ProductReportTable from "../components/ProductReportTable";
import StockFilter from "../components/StockFilter";

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


function Reports() {
  const [tab, setTab] = useState(0);
  const [duration, setDuration] = useState({
    startDate: "",
    endDate: "",
  });

  const [dataToExport, setDataToExport] = useState([]); 
  //console.table(dataToExport); 
  
  const [stockStatus, setStockStatus] = useState("");   


  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif", }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Reports
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary" centered>
          <Tab label="Inventory Summary" {...a11yProps(0)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
          <Tab label="Sales Report" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
          <Tab label="Purchase Report" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
          <Tab label="Outstanding Deliveries" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
        </Tabs>
      </Box>


      {tab === 0 ? (
          <>
            {/* To Do Exportation */}
            <StockFilter stockStatus={stockStatus}
                  onStatusChange={setStockStatus}
                  dataToExport={dataToExport}/>
          </>
        ) : tab === 1 ? (
          <>
            <DurationFilter duration={duration} onDurationChange={setDuration} dataToExport={dataToExport} tab={tab}/>
          </>
        ) : tab === 2 ? (
          <>
            <DurationFilter duration={duration} onDurationChange={setDuration} dataToExport={dataToExport} tab={tab}/>
          </>
        ) : tab === 3 ? (
          <> 
            {/* To Do Exportation */}
          </>
        ) : null}

      {/* Divider */}
      <Divider sx={{ my: 4 }} />

      <Paper elevation={0} sx={{ p: 2, mt: 0, borderRadius: 2, bgcolor: "transparent", border: "none" }}>

        {tab === 0 ? (
          <>
            <Box sx={{ mt: 0 }}>
              <ProductReportTable 
                stockStatus={stockStatus}
                setDataToExport={setDataToExport} />
            </Box>
          </>
        ) : tab === 1 ? (
          <>
            <Box sx={{ mt: 0 }}>

              <SalesReportTable 
                duration={duration} 
                setDataToExport={setDataToExport}
              />
              

            </Box>
          </>
        ) : tab === 2 ? (
          <>
            <Box sx={{ mt: 0 }}>

              <PurchaseReportTable
                duration={duration} 
                setDataToExport={setDataToExport}
              />

            </Box>
          </>
        ) : tab === 3 ? (
          <>
            <Box sx={{ mt: 0 }}>


            </Box>
          </>
        ) : null}



      </Paper>


    </Box>
  );
}

export default Reports;