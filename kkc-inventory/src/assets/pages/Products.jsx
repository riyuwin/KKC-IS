import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Tooltip, Chip, Stack, TextField, MenuItem } from "@mui/material";
import { MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import { Link } from "react-router-dom";

import ProductsCRUD from "../logics/products/ProductsCRUD";
import ProductDialog from "../components/ProductDialog";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import SearchBar from "../components/SearchBar";
import TablePager from "../components/TablePager";

function generateClientSku() {
  let s = "";
  for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10);
  return s;
}

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

function makeEmptyForm() {
  return {
    product_name: "",
    sku: generateClientSku(),
    description: "",
    unit: "",
    stock: 0,
    cost_price: "",
    selling_price: "",
    supplier_id: "",
    supplier: "",
    warehouse_id: "",
    warehouse_name: "",
  };
}

function Products() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [searchNow, setSearchNow] = useState("");

  // session & warehouse filter (admin only)
  const [role, setRole] = useState(""); // "admin" | "warehouse"
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("view");
  const [form, setForm] = useState(makeEmptyForm);
  const [selectedId, setSelectedId] = useState(null);

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_name");
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

  // load session & warehouses (admin only)
  useEffect(() => {
    (async () => {
      try {
        const sres = await fetch("/session", { credentials: "include" });
        const sdata = await sres.json();
        const r = String(sdata?.user?.role || "").toLowerCase();
        setRole(r);

        if (r === "admin") {
          const wres = await fetch("/warehouse", { credentials: "include" });
          const wdata = await wres.json();
          const list = Array.isArray(wdata) ? wdata : [];
          setWarehouses(
            list.map((w) => ({
              warehouse_id: w.warehouse_id,
              warehouse_name: w.warehouse_name || `Warehouse #${w.warehouse_id}`,
            }))
          );
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const warehouseId = role === "admin" ? selectedWarehouse : null;
      const data = await ProductsCRUD.fetchProducts(searchNow, warehouseId);
      setRows(Array.isArray(data) ? data : data?.results || []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [searchNow, role, selectedWarehouse]);

  const computedRows = useMemo(() => {
    return rows.map((r) => {
      const stock = Number(r.stock ?? 0);
      const status =
        stock <= 0
          ? { label: "Out of Stock", color: "error" }
          : stock <= 5
          ? { label: "Low", color: "warning" }
          : { label: "In Stock", color: "success" };

      const supplier_display = r.supplier ?? r.supplier_name ?? "";
      return { ...r, _stockStatus: status, supplier_display };
    });
  }, [rows]);

  const sortedRows = useMemo(
    () => stableSort(computedRows, getComparator(order, orderBy)),
    [computedRows, order, orderBy]
  );

  const closeDialog = () => {
    setOpen(false);
    setSelectedId(null);
    setForm(makeEmptyForm());
  };

  const openView = (row) => {
    setDialogMode("view");
    setForm({
      product_name: row.product_name ?? "",
      sku: row.sku ?? "",
      description: row.description ?? "",
      unit: row.unit ?? "",
      stock: Number(row.stock ?? 0),
      cost_price: row.cost_price ?? "",
      selling_price: row.selling_price ?? "",
      supplier_id: row.supplier_id ?? "",
      supplier: row.supplier ?? row.supplier_name ?? "",
      warehouse_id: row.warehouse_id ?? "",
      warehouse_name: row.warehouse_name ?? "",
    });
    setSelectedId(row.product_id ?? row.id ?? null);
    setOpen(true);
  };

  const openEdit = (row) => {
    setDialogMode("edit");
    setForm({
      product_name: row.product_name ?? "",
      sku: row.sku ?? generateClientSku(),
      description: row.description ?? "",
      unit: row.unit ?? "",
      stock: Number(row.stock ?? 0),
      cost_price: row.cost_price ?? "",
      selling_price: row.selling_price ?? "",
      supplier_id: row.supplier_id ?? "",
      supplier: row.supplier ?? row.supplier_name ?? "",
      warehouse_id: row.warehouse_id ?? "",
      warehouse_name: row.warehouse_name ?? "",
    });
    setSelectedId(row.product_id ?? row.id ?? null);
    setOpen(true);
  };

  const handleDelete = async (row) => {
    const id = row.product_id ?? row.id;
    if (!id) return;
    const res = await ProductsCRUD.deleteProduct(id, row.product_name);
    if (!res?.cancelled) await load();
  };

  const headerCellSx = {
    p: 1.5,
    fontSize: "0.95rem",
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

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5 }}>
        Products
      </Typography>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2, px: 1 }}
        spacing={2}
      >
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search products..."
        />

        <Stack direction="row" spacing={2} alignItems="center">
          {role === "admin" && (
            <TextField
              select
              size="small"
              label="Warehouse"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="all">All Warehouses</MenuItem>
              {warehouses.map((w) => (
                <MenuItem key={w.warehouse_id} value={String(w.warehouse_id)}>
                  {w.warehouse_name}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Button
            component={Link}
            to="/products/new"
            variant="contained"
            startIcon={<MdAdd />}
            sx={{
              bgcolor: "#E67600",
              "&:hover": { bgcolor: "#f99f3fff" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Add Product
          </Button>
        </Stack>
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
          <TablePager
            data={sortedRows}
            resetOn={`${order}-${orderBy}-${searchNow}-${selectedWarehouse}`}
            initialRowsPerPage={5}
          >
            {({ pagedRows, Pagination }) => (
              <>
                <Table size="small">
                  <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                    <TableRow>
                      {role === "admin" && (
                        <SortableHeader
                          id="warehouse_name"
                          label="Warehouse"
                          order={order}
                          orderBy={orderBy}
                          onSort={handleSort}
                        />
                      )}
                      <SortableHeader
                        id="product_name"
                        label="Product Name"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="sku"
                        label="SKU/Code"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="description"
                        label="Description"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="unit"
                        label="Unit"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="stock"
                        label="Current Stock"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="cost_price"
                        label="Cost Price"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="selling_price"
                        label="Selling Price"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="supplier_display"
                        label="Supplier"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <SortableHeader
                        id="_stockStatus.label"
                        label="Stock Status"
                        order={order}
                        orderBy={orderBy}
                        onSort={handleSort}
                      />
                      <TableCell sx={{ ...headerCellSx }} width={160}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={role === "admin" ? 11 : 10} align="center">
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading…</Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : pagedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={role === "admin" ? 11 : 10} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No products found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRows.map((row) => (
                        <TableRow key={row.product_id ?? row.id ?? row.sku}>
                          {role === "admin" && (
                            <TableCell>{row.warehouse_name || "—"}</TableCell>
                          )}
                          <TableCell>{row.product_name}</TableCell>
                          <TableCell>{row.sku}</TableCell>
                          <TableCell sx={wrapCellSx}>{row.description}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>{Number(row.stock ?? 0)}</TableCell>
                          <TableCell>
                            {row.cost_price === null || row.cost_price === "" ? "" : peso(row.cost_price)}
                          </TableCell>
                          <TableCell>
                            {row.selling_price === null || row.selling_price === "" ? "" : peso(row.selling_price)}
                          </TableCell>
                          <TableCell>{row.supplier_display}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row._stockStatus.label} color={row._stockStatus.color} />
                          </TableCell>
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

      <ProductDialog
        open={open}
        mode={dialogMode}
        initialData={form}
        onClose={closeDialog}
        onSwitchToEdit={() => setDialogMode("edit")}
        role={role}
        warehouses={warehouses}
        defaultWarehouseId={selectedWarehouse !== "all" ? Number(selectedWarehouse) : ""}
        onSubmit={async (payload) => {
          try {
            const isCreate = dialogMode === "create";
            let body = payload;
            if (isCreate && role === "admin") {
              const widFromDialog = payload?.warehouse_id ? Number(payload.warehouse_id) : null;
              const widFromFilter = selectedWarehouse !== "all" ? Number(selectedWarehouse) : null;
              const finalWid = widFromDialog || widFromFilter || null;
              if (finalWid) body = { ...payload, warehouse_id: finalWid };
            }

            const res = isCreate
              ? await ProductsCRUD.createProduct(body)
              : await ProductsCRUD.updateProduct(selectedId, payload);

            if (res?.cancelled) return;
            closeDialog();
            await load();
          } catch {
            // error dialogs handled inside CRUD
          }
        }}
      />
    </Box>
  );
}

export default Products;
