import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, CircularProgress, Tooltip, Chip, Stack
} from "@mui/material";
import { MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import ProductDialog from "../components/ProductDialog";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import Swal from "sweetalert2";
import SearchBar from "../components/SearchBar";
import TablePager from "../components/TablePager";

// auto-generated sku/code
function generateClientSku() {
  let s = "";
  for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// Peso sign
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

const emptyForm = {
  product_name: "",
  sku: generateClientSku(),
  description: "",
  unit: "",
  stock: 0,
  cost_price: "",
  selling_price: "",
  supplier_id: "",
  supplier: "",
};

// SweetAlert2 helpers (z-index above MUI Dialog/Modal 1300)
const swalFire = (opts) =>
  Swal.fire({
    heightAuto: false,
    ...opts,
    didOpen: () => {
      const c = Swal.getContainer?.();
      if (c) c.style.zIndex = "20000"; // higher than MUI dialog
    },
  });

const swalConfirm = async (title, text) => {
  const res = await swalFire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: true,
    focusCancel: true,
  });
  return res.isConfirmed;
};

const swalSuccess = (text) =>
  swalFire({
    icon: "success",
    title: "Success",
    text,
    timer: 1400,
    showConfirmButton: false,
  });

const swalError = (text) =>
  swalFire({
    icon: "error",
    title: "Oops",
    text,
  });

function Products() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // search text controlled by SearchBar
  const [search, setSearch] = useState("");
  // debounced value that actually triggers fetch
  const [searchNow, setSearchNow] = useState("");

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // 'create' | 'edit' | 'view'
  const [form, setForm] = useState({ ...emptyForm });
  const [selectedId, setSelectedId] = useState(null);

  // Sorting
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_name");
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Debounce search text -> searchNow
  useEffect(() => {
    const t = setTimeout(() => setSearchNow(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch products
  const load = async () => {
    setLoading(true);
    try {
      const data = await ProductsCRUD.fetchProducts(searchNow);
      setRows(Array.isArray(data) ? data : data?.results || []);
    } catch (e) {
      await swalError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [searchNow]);

  // Table helpers
  const computedRows = useMemo(() => {
    return rows.map((r) => {
      const stock = Number(r.stock ?? 0);
      const status =
        stock <= 0
          ? { label: "Out of Stock", color: "error" }
          : stock <= 5
          ? { label: "Low", color: "warning" }
          : { label: "In Stock", color: "success" };

      const supplier_display = r.supplier ?? r.supplier_name ?? ""; // <— unified

      return { ...r, _stockStatus: status, supplier_display };
    });
  }, [rows]);

  // Apply sorting
  const sortedRows = useMemo(
    () => stableSort(computedRows, getComparator(order, orderBy)),
    [computedRows, order, orderBy]
  );

  // Dialog/Modal helpers
  const closeDialog = () => {
    setOpen(false);
    setSelectedId(null);
    setForm({ ...emptyForm, sku: generateClientSku() });
  };

  const openCreate = () => {
    setDialogMode("create");
    setForm({ ...emptyForm, sku: generateClientSku() });
    setSelectedId(null);
    setOpen(true);
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
    });
    setSelectedId(row.product_id ?? row.id ?? null);
    setOpen(true);
  };

  // CRUD actions with SweetAlerts
  const handleDelete = async (row) => {
    const id = row.product_id ?? row.id;
    if (!id) {
      await swalError("Missing product ID.");
      return;
    }
    const ok = await swalConfirm("Delete product?", `Delete "${row.product_name}"? This cannot be undone.`);
    if (!ok) return;

    try {
      setLoading(true);
      await ProductsCRUD.deleteProduct(id);
      await swalSuccess("Product deleted.");
      await load();
    } catch (e) {
      await swalError(e.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  // Header Styling
  const headerCellSx = {
    p: 1.5,
    fontSize: "0.95rem",
    fontWeight: 700,
    bgcolor: "#706f6fff",
    textAlign: "center",
    color: "white",
  };

  // Body Styling
  const bodyCellSx = {
    textAlign: "center",
    fontSize: "0.90rem",
    py: 2,   // vertical padding
    px: 1,   // horizontal padding
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  // Wrap Cell Styling
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
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Products
      </Typography>

      {/* Search left, Add right */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <SearchBar search={search} onSearchChange={setSearch} placeholder="Search products..." />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={openCreate}
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

      {/* Table */}
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
      resetOn={`${order}-${orderBy}-${searchNow}`}
      initialRowsPerPage={5}
    >
      {({ pagedRows, Pagination }) => (
        <>
          <Table size="small">
            <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
              <TableRow>
                <SortableHeader id="product_name" label="Product Name" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="sku" label="SKU/Code" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="description" label="Description" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="unit" label="Unit" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="stock" label="Current Stock" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="cost_price" label="Cost Price" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="selling_price" label="Selling Price" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="supplier_display" label="Supplier" order={order} orderBy={orderBy} onSort={handleSort} />
                <SortableHeader id="_stockStatus.label" label="Stock Status" order={order} orderBy={orderBy} onSort={handleSort} />
                <TableCell sx={{ ...headerCellSx }} width={160}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Loading…</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
              ) : pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" py={2}>
                      No products found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow key={row.product_id ?? row.id ?? row.sku}>
                    <TableCell>{row.product_name}</TableCell>
                    <TableCell>{row.sku}</TableCell>
                    <TableCell sx={wrapCellSx}>{row.description}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{Number(row.stock ?? 0)}</TableCell>
                    <TableCell>{row.cost_price === null || row.cost_price === "" ? "" : peso(row.cost_price)}</TableCell>
                    <TableCell>{row.selling_price === null || row.selling_price === "" ? "" : peso(row.selling_price)}</TableCell>
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

          {/* The ready-made pagination bar (centered) */}
          <Pagination />
        </>
      )}
    </TablePager>
        </TableContainer>
      </Paper>

      {/* Dialog/Modal */}
      <ProductDialog
        open={open}
        mode={dialogMode}
        initialData={form}
        onClose={closeDialog}
        onSwitchToEdit={() => setDialogMode("edit")}
        onSubmit={async (payload) => {
          const isCreate = dialogMode === "create";
          const ok = await swalConfirm(
            isCreate ? "Add product?" : "Update product?",
            isCreate ? "This will create a new product." : "Save changes to this product?"
          );
          if (!ok) return;

          try {
            setLoading(true);
            if (isCreate) {
              await ProductsCRUD.createProduct(payload);
              await swalSuccess("Product created.");
            } else {
              const id = selectedId;
              if (!id) throw new Error("Missing product ID for update.");
              await ProductsCRUD.updateProduct(id, payload);
              await swalSuccess("Product updated.");
            }
            closeDialog();   // after success
            await load();    // refresh table
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

export default Products;
