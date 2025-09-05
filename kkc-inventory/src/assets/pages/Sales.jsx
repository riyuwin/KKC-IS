import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, TextField, Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Tooltip, Chip, Stack } from "@mui/material";
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import PurchaseDialog from "../components/PurchaseDialog";
import SalesDialog from "../components/SalesDialog";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import { InsertSales } from "../logics/admin/ManageSales";

/* Typescripts ----------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/
// Header style
const headerCellSx = {
  py: 3.0, px: 0.75, fontSize: "0.90rem", fontWeight: 700, // bigger than rows
  bgcolor: "#706f6fff", textAlign: "center", color: "white",
};

// Body style
const bodyCellSx = {
  textAlign: "center",
  fontSize: "0.90rem",
  py: 2,
  px: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// Wrapping Cell Style (so that it has not ellipses)
const wrapCellSx = {
  whiteSpace: "normal",
  wordBreak: "break-word",
  textOverflow: "clip",
  overflow: "visible",
  maxWidth: "none",
  px: 1.25,
};
/* Typescripts ----------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>*/

function Sales() {
  // Modal Variables States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  // Dynamics Variable States
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [accountId, setAccountId] = useState(null);

  useEffect(() => {
    const localStorageUserData = localStorage.getItem("user");

    if (localStorageUserData) {
      try {
        const userObj = JSON.parse(localStorageUserData);
        setAccountId(userObj.account_id);
        console.log("Account ID:", userObj.account_id);
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    } else {
      console.log("No user found in localStorage");
    }
  }, []);

  const DialogHandler = (selectedDialogMode) => {
    setDialogMode(selectedDialogMode);
    setDialogOpen(true);
  };

  // Data Fetcher 
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Warehouses
        const { data: warehouseData } = await RetrieveWarehouse();
        setWarehouses(warehouseData);
        /* console.log("Warehouses:", warehouseData); */

        // Products
        const productData = await ProductsCRUD.fetchProducts();
        setProducts(productData);
        /* console.log("Products:", productData); */
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, []);
 
  const handleSalesSubmit = (formData) => { 
    const payload = {
      ...formData,
      account_id: accountId,  
    };

    console.log("Sales Payload:", payload);
    InsertSales(payload); 
  };




  // Sort
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("purchase_date");
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif", }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Sales
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          sx={{ bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3fff" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
          onClick={() => { DialogHandler() }}
        >
          Add Sales
        </Button>
      </Stack>

      <Paper elevation={1} sx={{ borderRadius: 2, bgcolor: "transparent", boxShadow: "none" }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            border: "1px solid #ddd",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            bgcolor: "background.paper",
          }}
        >

          <Table size="small" sx={{ tableLayout: "auto", width: "100%" }}>
            <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
              <TableRow>
                <SortableHeader id="number" label="No." order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="supplier_name" label="Date" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="product_name" label="Customer/Company Name" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="quantity" label="Product" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="qty_received" label="Quantity Sold" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="remaining" label="Delivered" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="unit_cost" label="Selling Price" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="total_cost" label="Total" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="purchase_status" label="Delivery Status" order={order} orderBy={orderBy} onSort={handleSort} />
                <TableCell sx={headerCellSx}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
              {/* map rows here */}
            </TableBody>
          </Table>

        </TableContainer>
      </Paper>

      <SalesDialog
        open={dialogOpen}
        mode={null}
        accountId={accountId}
        productsData={products}
        warehousesData={warehouses}
        initialData={null}
        onClose={() => setDialogOpen(false)}
        onSwitchToEdit={null}
        onSubmit={handleSalesSubmit}
      />
    </Box>
  );
}

export default Sales;