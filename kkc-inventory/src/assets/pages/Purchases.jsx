import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Tooltip, Chip, Stack } from "@mui/material";
import { MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import PurchasesCRUD from "../logics/purchases/PurchasesCRUD";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import PurchaseDialog from "../components/PurchaseDialog";
import { PortSuppliers, PortProducts, PortSession } from "../api_ports/api";
import SearchBar from "../components/SearchBar";
import TablePager from "../components/TablePager";
import { Link } from "react-router-dom";
import AdminWarehouseSelector from "../components/AdminWarehouseSelector";

function peso(n) {
  if (n === "" || n === null || typeof n === "undefined") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });
}

function dateFormat(v) {
  if (!v) return "";

  if (typeof v === "string") {
    const plain = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (plain) {
      const [_, y, mo, d] = plain;
      const dt = new Date(Number(y), Number(mo) - 1, Number(d));
      return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
  }

  const dt = new Date(v);
  if (Number.isNaN(dt.getTime())) return String(v);
  return dt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const fetchJSON = async (url) => {
  const r = await fetch(url, { credentials: "include" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error || `Request failed: ${url}`);
  return data;
};

function Purchases() {
  const [rows, setRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchNow, setSearchNow] = useState("");

  const [role, setRole] = useState("");
  const isAdmin = role === "admin";

  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("purchase_date");
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchNow(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        const sdata = await fetchJSON(PortSession);
        const r = String(sdata?.user?.role || "").toLowerCase(); // handles "Admin"
        setRole(r);
      } catch (e) {
        console.error("Session load failed:", e);
        setRole("");
      }
    })();
  }, []);

  const loadMeta = useCallback(async () => {
    try {
      const [sres, pres] = await Promise.all([
        fetch(PortSuppliers, { credentials: "include" }),
        fetch(PortProducts, { credentials: "include" }),
      ]);

      const [supsJson, prodsJson] = await Promise.all([sres.json(), pres.json()]);

      setSuppliers(Array.isArray(supsJson) ? supsJson : []);
      setProducts(Array.isArray(prodsJson) ? prodsJson : []);
    } catch (e) {
      console.error("Failed to load suppliers/products:", e);
      setSuppliers([]);
      setProducts([]);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PurchasesCRUD.fetchPurchases(searchNow, selectedWarehouseId);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [searchNow, selectedWarehouseId]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    load();
  }, [load]);

  const computedRows = useMemo(
    () =>
      rows.map((r) => ({
        ...r,
        display_total_cost: r.total_cost ?? r.purchase_total_cost ?? 0,
      })),
    [rows]
  );

  const sortedRows = useMemo(
    () => stableSort(computedRows, getComparator(order, orderBy)),
    [computedRows, order, orderBy]
  );

  const getSupplierIdFromRow = (row) =>
    row.supplier_id ?? row.item_supplier_id ?? row.header_supplier_id ?? null;

  const headerCellSx = {
    py: 3.0,
    px: 0.75,
    fontSize: "0.90rem",
    fontWeight: 700,
    bgcolor: "#706f6fff",
    textAlign: "center",
    color: "white",
  };
  const bodyCellSx = {
    textAlign: "center",
    fontSize: "0.90rem",
    py: 2,
    px: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };
  const wrapCellSx = {
    whiteSpace: "normal",
    wordBreak: "break-word",
    textOverflow: "clip",
    overflow: "visible",
    maxWidth: "none",
    px: 1.25,
  };

  const closeDialog = () => {
    setOpen(false);
    setSelectedId(null);
    setFormData({});
  };

  const openCreate = () => {
    setDialogMode("create");
    setSelectedId(null);
    setFormData({});
    setOpen(true);
  };

  const openView = (row) => {
    setDialogMode("view");
    setSelectedId(row.purchase_id);
    setFormData({
      purchase_date: row.purchase_date,
      supplier_id: getSupplierIdFromRow(row),
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
      supplier_id: getSupplierIdFromRow(row),
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
    const res = await PurchasesCRUD.deletePurchase(row.purchase_id, row.purchase_id);
    if (!res?.cancelled) await load();
  };

  const colWidths = [
    "9%",
    "10%",
    "11%",
    "10%",
    "10%",
    "9%",
    "7%",
    "8%",
    "10%",
    "8%",
    "8%",
  ];

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5 }}>
        Purchase
      </Typography>

      <Box
        sx={{
          mb: 2,
          px: 1,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
            justifyContent: "flex-start",
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SearchBar
              search={search}
              onSearchChange={setSearch}
              placeholder="Search purchases..."
            />
          </Box>

          {isAdmin && (
            <Box sx={{ flexShrink: 0 }}>
              <AdminWarehouseSelector
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                sx={{
                  minWidth: 420,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0,0,0,0.18)",
                  },
                }}
              />
            </Box>
          )}
        </Box>

        <Button
          component={Link}
          to="/purchases/new"
          variant="contained"
          startIcon={<MdAdd />}
          sx={{
            bgcolor: "#E67600",
            "&:hover": { bgcolor: "#f99f3fff" },
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            whiteSpace: "nowrap",
            ml: "auto",
          }}
          onClick={openCreate}
        >
          Add Purchase
        </Button>
      </Box>

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
          <TablePager
            data={sortedRows}
            resetOn={`${order}-${orderBy}-${searchNow}-${selectedWarehouseId}-${role}`}
            initialRowsPerPage={5}
            align="left"
          >
            {({ pagedRows, Pagination }) => (
              <>
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <colgroup>
                    {colWidths.map((w, idx) => (
                      <col key={idx} style={{ width: w }} />
                    ))}
                  </colgroup>

                  <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                    <TableRow>
                      <SortableHeader id="purchase_date" label="Date" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="supplier_name" label="Supplier" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="product_name" label="Product" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="quantity" label="Purchased" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="qty_received" label="Received" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="remaining" label="Remaining" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="unit_cost" label="Unit ₱" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="total_cost" label="Total ₱" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="purchase_status" label="Order" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="purchase_payment_status" label="Payment" order={order} orderBy={orderBy} onSort={handleSort} />
                      <TableCell sx={headerCellSx}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={11}>
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                            <CircularProgress size={18} />
                            <Typography variant="body2">Loading…</Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : pagedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11}>
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No purchases found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRows.map((row) => (
                        <TableRow key={`${row.purchase_id}-${row.purchase_item_id}`}>
                          <TableCell sx={wrapCellSx}>{dateFormat(row.purchase_date)}</TableCell>
                          <TableCell title={row.supplier_name}>{row.supplier_name}</TableCell>
                          <TableCell title={row.product_name}>{row.product_name}</TableCell>
                          <TableCell title={String(row.quantity)}>{row.quantity}</TableCell>
                          <TableCell title={String(row.qty_received)}>{row.qty_received}</TableCell>
                          <TableCell title={String(row.remaining)}>{row.remaining}</TableCell>
                          <TableCell title={peso(row.unit_cost)}>{peso(row.unit_cost)}</TableCell>
                          <TableCell title={peso(row.total_cost)}>{peso(row.total_cost)}</TableCell>
                          <TableCell sx={wrapCellSx}>
                            <Chip
                              size="small"
                              color={row.remaining === 0 ? "success" : "warning"}
                              label={row.purchase_status}
                              sx={{ px: 0.9, maxWidth: "none" }}
                            />
                          </TableCell>
                          <TableCell sx={wrapCellSx}>{row.purchase_payment_status}</TableCell>
                          <TableCell>
                            <Stack direction="row" justifyContent="center" spacing={-0.4}>
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
                      ))
                    )}
                  </TableBody>
                </Table>

                <Pagination />
              </>
            )}
          </TablePager>
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
          try {
            const isCreate = dialogMode === "create";

            let body = payload;
            if (isCreate && isAdmin && selectedWarehouseId) {
              body = { ...payload, warehouse_id: Number(selectedWarehouseId) };
            }

            const res = isCreate
              ? await PurchasesCRUD.createPurchase(body)
              : await PurchasesCRUD.updatePurchase(selectedId, payload);

            if (res?.cancelled) return;
            closeDialog();
            await load();
          } catch {
          }
        }}
      />
    </Box>
  );
}

export default Purchases;
