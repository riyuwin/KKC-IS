import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Tabs, Tab, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, useMediaQuery } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import { useNavigate } from "react-router-dom";
import { ValidateUserLoggedIn } from "../logics/auth/ValidateLogin";
import ReturnDialog from "../components/ReturnDialogs";

import {
  RetrieveSalesReturns, RetrievePurchaseReturns,
  InsertSalesReturn, UpdateSalesReturn, DeleteSalesReturn,
  InsertPurchaseReturn, UpdatePurchaseReturn, DeletePurchaseReturn
} from "../logics/returns/ManageReturns";

function a11yProps(index) { return { id: `returns-tab-${index}`, "aria-controls": `returns-tabpanel-${index}` }; }
function TabPanel({ children, value, index }) {
  return (
    <Box role="tabpanel" hidden={value !== index} id={`returns-tabpanel-${index}`} aria-labelledby={`returns-tab-${index}`} sx={{ pt: 2 }}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
}

const SALES_COLS = [
  { id: "number", label: "No." },
  { id: "date", label: "Date" },
  { id: "product", label: "Product" },
  { id: "quantity", label: "Qty. Returned" },
  { id: "reason", label: "Reason" },
  { id: "customer_name", label: "Customer/Company" },
  { id: "confirmed", label: "Confirmed" },
];

const PURCHASE_COLS = [
  { id: "number", label: "No." },
  { id: "date", label: "Date" },
  { id: "product", label: "Product" },
  { id: "quantity", label: "Qty. Returned" },
  { id: "reason", label: "Reason" },
  { id: "supplier_name", label: "Supplier" },
  { id: "confirmed", label: "Confirmed" },
];

export default function Returns() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const [salesReturns, setSalesReturns] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);

  const [srOrderBy, setSrOrderBy] = useState("date");
  const [srOrder, setSrOrder] = useState("desc");
  const [prOrderBy, setPrOrderBy] = useState("date");
  const [prOrder, setPrOrder] = useState("desc");

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("sales"); // 'sales' | 'purchase'
  const [editRow, setEditRow] = useState(null);

  useEffect(() => {
    (async () => {
      const user = await ValidateUserLoggedIn(navigate);
      if (!user) return navigate("/login");
    })();
  }, [navigate]);

  const refreshSales = async () => {
    const { data } = await RetrieveSalesReturns(search);
    setSalesReturns(data);
  };
  const refreshPurchase = async () => {
    const { data } = await RetrievePurchaseReturns(search);
    setPurchaseReturns(data);
  };

  useEffect(() => {
    refreshSales(); refreshPurchase();
    const t = setInterval(() => { refreshSales(); refreshPurchase(); }, 2500);
    return () => clearInterval(t);
  }, [search]);

  const sortSales = (prop) => { const isAsc = srOrderBy === prop && srOrder === "asc"; setSrOrder(isAsc ? "desc" : "asc"); setSrOrderBy(prop); };
  const sortPurchase = (prop) => { const isAsc = prOrderBy === prop && prOrder === "asc"; setPrOrder(isAsc ? "desc" : "asc"); setPrOrderBy(prop); };

  const sortedSales = useMemo(() => stableSort(salesReturns, getComparator(srOrder, srOrderBy)), [salesReturns, srOrder, srOrderBy]);
  const sortedPurchase = useMemo(() => stableSort(purchaseReturns, getComparator(prOrder, prOrderBy)), [purchaseReturns, prOrder, prOrderBy]);

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        {tab === 0 ? "Sales Returns" : "Purchase Returns"}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {tab === 0 ? "List of Sales Returns" : "List of Purchase Returns"}
        </Typography>

        {tab === 0 ? (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setDialogMode("sales"); setEditRow(null); setOpenDialog(true); }}
            sx={{ bgcolor: "#FA8201", "&:hover": { bgcolor: "#E67600" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
            Add Sales Return
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { setDialogMode("purchase"); setEditRow(null); setOpenDialog(true); }}
            sx={{ bgcolor: "#FA8201", "&:hover": { bgcolor: "#E67600" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}>
            Add Purchase Return
          </Button>
        )}
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <SearchBar search={search} onSearchChange={setSearch} />
      </Stack>

      <Paper sx={{ borderRadius: 2, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary" centered>
            <Tab label="Sales Returns" {...a11yProps(0)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
            <Tab label="Purchase Returns" {...a11yProps(1)} sx={{ fontWeight: 600, fontSize: "1rem", textTransform: "none" }} />
          </Tabs>
        </Box>

        {/* SALES RETURNS */}
        <TabPanel value={tab} index={0}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}>
            <Table size="small">
              <TableHead sx={{ "& .MuiTableCell-root": { fontSize: "1.1rem", fontWeight: 700 } }}>
                <TableRow>
                  {SALES_COLS.map((c) => (
                    <SortableHeader key={c.id} id={c.id} label={c.label} order={srOrder} orderBy={srOrderBy} onSort={sortSales} />
                  ))}
                  <TableCell sx={{ fontWeight: 700, textAlign: "center" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ "& .MuiTableCell-root": { fontSize: "0.95rem" } }}>
                {sortedSales.map((r, idx) => (
                  <TableRow key={r.sales_return_id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{idx + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.date?.slice(0, 10)}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.product}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.quantity}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.reason}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.customer_name}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.confirmed ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right" sx={{ textAlign: "center" }}>
                      <IconButton size="small" color="primary" onClick={()=>{ setDialogMode("sales"); setEditRow(r); setOpenDialog(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => DeleteSalesReturn(r.sales_return_id).then(refreshSales)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedSales.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>No sales returns yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* PURCHASE RETURNS */}
        <TabPanel value={tab} index={1}>
          <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}>
            <Table size="small">
              <TableHead sx={{ "& .MuiTableCell-root": { fontSize: "1.1rem", fontWeight: 700 } }}>
                <TableRow>
                  {PURCHASE_COLS.map((c) => (
                    <SortableHeader key={c.id} id={c.id} label={c.label} order={prOrder} orderBy={prOrderBy} onSort={sortPurchase} />
                  ))}
                  <TableCell sx={{ fontWeight: 700, textAlign: "center" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ "& .MuiTableCell-root": { fontSize: "0.95rem" } }}>
                {sortedPurchase.map((r, idx) => (
                  <TableRow key={r.purchase_return_id} hover>
                    <TableCell sx={{ textAlign: "center" }}>{idx + 1}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.date?.slice(0, 10)}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.product}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.quantity}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.reason}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.supplier_name}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{r.confirmed ? 'Yes' : 'No'}</TableCell>
                    <TableCell align="right" sx={{ textAlign: "center" }}>
                      <IconButton size="small" color="primary" onClick={()=>{ setDialogMode("purchase"); setEditRow(r); setOpenDialog(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => DeletePurchaseReturn(r.purchase_return_id).then(refreshPurchase)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedPurchase.length === 0 && (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>No purchase returns yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Dialogs */}
      <ReturnDialog
        mode={dialogMode}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        initial={editRow}
        onSubmit={async (payload) => {
          if (dialogMode === "sales") {
            if (editRow) await UpdateSalesReturn(editRow.sales_return_id, payload);
            else await InsertSalesReturn(payload);
            setOpenDialog(false);
            refreshSales();
          } else {
            if (editRow) await UpdatePurchaseReturn(editRow.purchase_return_id, payload);
            else await InsertPurchaseReturn(payload);
            setOpenDialog(false);
            refreshPurchase();
          }
        }}
      />
    </Box>
  );
}
