import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, TextField, Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Tooltip, Chip, Stack } from "@mui/material";
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import PurchaseDialog from "../components/PurchaseDialog";
import SalesDialog from "../components/SalesDialog";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import { InsertSales, RetrieveSales } from "../logics/admin/ManageSales";

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


function dateFormat(v) {
  if (!v) return "";
  if (typeof v === "string") {
    const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) {
      const [y, mo, d] = m[1].split("-").map(Number);
      const dt = new Date(y, mo - 1, d);
      return dt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }
  const dt = new Date(v);
  if (Number.isNaN(dt.getTime())) return String(v);
  return dt.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Sales() {
  // Modal Variables States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null);
  // Dynamics Variable States
  const [sales, setSales] = useState([]);
  const [salesItems, setSalesItems] = useState([]);
  const [salesDeliveries, setSalesDeliveries] = useState([]);
  const [salesAttachments, setSalesAttachments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [accountId, setAccountId] = useState(null);

  // Filter Variables
  const [search, setSearch] = useState("");

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
        // Sales
        const { data: salesData } = await RetrieveSales();
        setSales(salesData.sales);
        setSalesDeliveries(salesData.deliveries); 
        setSalesItems(salesData.items); 
        setSalesAttachments(salesData.attachments); 
        console.log("salesData:", salesData);

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

    /* console.log("Sales Payload:", payload);
    console.log("accountId accountId:", accountId); */
    InsertSales(payload);
  };
 
  
  // Memoized Filtered sales (no sorting)
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const p = products.find((p) => p.product_id === s.product_id);

      return (
        s.sale_payment_status.toLowerCase().includes(search.toLowerCase()) ||
        s.delivery_status.toLowerCase().includes(search.toLowerCase()) ||
        (p &&
          (p.product_name.toLowerCase().includes(search.toLowerCase()) ||
          p.supplier_id.toLowerCase().includes(search.toLowerCase())))
      );
    });
  }, [sales, products, search]);




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
                <TableCell sx={headerCellSx}>No.</TableCell>
                <TableCell sx={headerCellSx}>Date</TableCell>
                <TableCell sx={headerCellSx}>Customer/Company Name</TableCell>
                <TableCell sx={headerCellSx}>Product</TableCell>
                <TableCell sx={headerCellSx}>Quantity Sold</TableCell>
                <TableCell sx={headerCellSx}>Delivered</TableCell>
                <TableCell sx={headerCellSx}>Selling Price</TableCell>
                <TableCell sx={headerCellSx}>Total</TableCell>
                <TableCell sx={headerCellSx}>Payment Status</TableCell>
                <TableCell sx={headerCellSx}>Delivery Status</TableCell> 
                <TableCell sx={headerCellSx}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
              {filteredSales.map((row, index) => {
                const p = products.find((prod) => prod.product_id === row.product_id);
                const sales_item = salesItems.find((salesItems) => salesItems.sales_id === row.sales_id);
                console.log("ASFSFAS", sales_item)

                return (
                  <TableRow key={row.sale_id ?? index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{dateFormat(row.sale_date)}</TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{sales_item ? sales_item.product_name : sales_item.product_id}</TableCell>
                    <TableCell>{p ? p.supplier_id : "Null"}</TableCell>
                    <TableCell>{"Null"}</TableCell>
                    <TableCell>{"Null"}</TableCell>
                    <TableCell>{"Null"}</TableCell>
                    <TableCell>{row.sale_payment_status}</TableCell>
                    <TableCell>{row.delivery_status}</TableCell>

                    <TableCell>
                      <Stack direction="row" justifyContent="center" spacing={0.5}>
                        <Tooltip title="View">
                          <IconButton size="small" color="success" onClick={() => openView(row)}>
                            <MdVisibility style={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => openEdit(row)}>
                            <MdEdit style={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                            <MdDelete style={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
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