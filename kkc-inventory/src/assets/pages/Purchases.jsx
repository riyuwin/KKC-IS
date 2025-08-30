import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, TextField, Button, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Tooltip, Chip, Stack
} from "@mui/material";
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import PurchasesCRUD from "../logics/purchases/PurchasesCRUD";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import PurchaseDialog from "../components/PurchaseDialog";
import { PortSuppliers, PortProducts } from "../api_ports/api";

function peso(n) {
  if (n === "" || n === null || typeof n === "undefined") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}

// SweetAlert helpers
const swalFire = (opts) =>
  Swal.fire({
    heightAuto: false,
    ...opts,
    didOpen: () => {
      const c = Swal.getContainer?.();
      if (c) c.style.zIndex = "20000";
    },
  });
const swalConfirm = async (title, text) => {
  const res = await swalFire({
    icon: "question", title, text,
    showCancelButton: true, confirmButtonText: "Yes", cancelButtonText: "No",
    reverseButtons: true, focusCancel: true,
  });
  return res.isConfirmed;
};
const swalSuccess = (text) => swalFire({ icon: "success", title: "Success", text, timer: 1400, showConfirmButton: false });
const swalError   = (text) => swalFire({ icon: "error", title: "Oops", text });

export default function Purchases() {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchNow, setSearchNow] = useState("");

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});

  // sort
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("purchase_date");
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  useEffect(() => {
    const t = setTimeout(() => setSearchNow(search), 150);
    return () => clearTimeout(t);
  }, [search]);
  const onSearchKey = (e) => { if (e.key === "Enter") setSearchNow(search); };

  async function loadMeta() {
    try {
      const [sres, pres] = await Promise.all([
        fetch(PortSuppliers), fetch(PortProducts)
      ]);
      const [sups, prods] = await Promise.all([sres.json(), pres.json()]);
      setSuppliers(Array.isArray(sups) ? sups : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {
      await swalError(e.message || "Failed to load meta");
    }
  }

  async function load() {
    setLoading(true);
    try {
      const data = await PurchasesCRUD.fetchPurchases(searchNow);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      await swalError(e.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { load(); }, [searchNow]);

  // computed rows for sorting / display
  const computedRows = useMemo(() => {
    return rows.map(r => {
      return {
        ...r,
        display_total_cost: r.total_cost ?? r.purchase_total_cost ?? 0,
      };
    });
  }, [rows]);

  const sortedRows = useMemo(
    () => stableSort(computedRows, getComparator(order, orderBy)),
    [computedRows, order, orderBy]
  );

  const headerCellSx = {
    p: 1.5, fontSize: "0.95rem", fontWeight: 700,
    bgcolor: "#706f6fff", textAlign: "center", color: "white",
  };

  // dialog controls
  const closeDialog = () => { setOpen(false); setSelectedId(null); setFormData({}); };
  const openCreate = () => { setDialogMode("create"); setSelectedId(null); setFormData({}); setOpen(true); };
  const openView = (row) => {
    setDialogMode("view");
    setSelectedId(row.purchase_id);
    setFormData({
      purchase_date: row.purchase_date,
      supplier_id: row.supplier_id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_cost: row.unit_cost,
      total_cost: row.total_cost,
      purchase_status: row.purchase_status,
      qty_received: row.qty_received,
      purchase_payment_status: row.purchase_payment_status,
    });
    setOpen(true);
  };
  const openEdit = (row) => {
    setDialogMode("edit");
    setSelectedId(row.purchase_id);
    setFormData({
      purchase_date: row.purchase_date,
      supplier_id: row.supplier_id,
      product_id: row.product_id,
      quantity: row.quantity,
      unit_cost: row.unit_cost,
      total_cost: row.total_cost,
      purchase_status: row.purchase_status,
      qty_received: row.qty_received,
      purchase_payment_status: row.purchase_payment_status,
    });
    setOpen(true);
  };

  const handleDelete = async (row) => {
    const ok = await swalConfirm("Delete purchase?", `This will remove Purchase #${row.purchase_id}.`);
    if (!ok) return;
    try {
      setLoading(true);
      await PurchasesCRUD.deletePurchase(row.purchase_id);
      await swalSuccess("Purchase deleted.");
      await load();
    } catch (e) {
      await swalError(e.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Purchase
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <TextField
          size="small"
          placeholder="Search purchases…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={onSearchKey}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MdSearch />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 420, width: "100%" }}
        />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={openCreate}
          sx={{ bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3fff" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
        >
          Add Purchase
        </Button>
      </Stack>

      <Paper elevation={1} sx={{ borderRadius: 2, bgcolor: "transparent", boxShadow: "none" }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}
        >
          <Table size="small">
            <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
              <TableRow>
                <SortableHeader id="purchase_date" label="Date" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="supplier_name" label="Supplier Name" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="product_name" label="Product" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="quantity" label="No. of Purchased Items" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="qty_received" label="Qty. Received" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="remaining" label="Remaining" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="unit_cost" label="Unit Cost" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="total_cost" label="Total Cost" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="purchase_status" label="Order Status" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="purchase_payment_status" label="Payment Status" order={order} orderBy={orderBy} onSort={handleSort} />
                <TableCell sx={{ ...headerCellSx }} width={160}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody sx={{ "& .MuiTableCell-root": { textAlign: "center" } }}>
              {loading && (
                <TableRow>
                  <TableCell colSpan={11}>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Loading…</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}

              {!loading && sortedRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11}>
                    <Typography variant="body2" color="text.secondary" py={2}>
                      No purchases found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}

              {!loading && sortedRows.map((row) => (
                <TableRow key={`${row.purchase_id}-${row.purchase_item_id}`}>
                  <TableCell>{row.purchase_date}</TableCell>
                  <TableCell>{row.supplier_name}</TableCell>
                  <TableCell>{row.product_name}</TableCell>
                  <TableCell>{row.quantity}</TableCell>
                  <TableCell>{row.qty_received}</TableCell>
                  <TableCell>{row.remaining}</TableCell>
                  <TableCell>{peso(row.unit_cost)}</TableCell>
                  <TableCell>{peso(row.total_cost)}</TableCell>
                  <TableCell>
                    <Chip size="small" color={row.remaining === 0 ? 'success' : 'warning'} label={row.purchase_status} />
                  </TableCell>
                  <TableCell>{row.purchase_payment_status}</TableCell>
                  <TableCell>
                    <Stack direction="row" justifyContent="center">
                      <Tooltip title="View">
                        <IconButton size="medium" color="success" onClick={() => openView(row)}>
                          <MdVisibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="medium" color="primary" onClick={() => openEdit(row)}>
                          <MdEdit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="medium" color="error" onClick={() => handleDelete(row)}>
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>

      <PurchaseDialog
        open={open}
        mode={dialogMode}
        initialData={formData}
        suppliers={suppliers}
        products={products}
        onClose={closeDialog}
        onSwitchToEdit={() => setDialogMode("edit")}
        onSubmit={async (payload) => {
          const isCreate = dialogMode === "create";
          const ok = await swalConfirm(
            isCreate ? "Add purchase?" : "Update purchase?",
            isCreate ? "This will create a new purchase." : "Save changes to this purchase?"
          );
          if (!ok) return;

          try {
            setLoading(true);
            if (isCreate) {
              await PurchasesCRUD.createPurchase(payload);
              await swalSuccess("Purchase created.");
            } else {
              await PurchasesCRUD.updatePurchase(selectedId, payload);
              await swalSuccess("Purchase updated.");
            }
            closeDialog();
            await load();
          } catch (e) {
            await swalError(e.message || "Save failed.");
          } finally {
            setLoading(false);
          }
        }}
      />
    </Box>
  );
}
