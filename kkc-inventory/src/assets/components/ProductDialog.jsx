import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Button, IconButton, Typography, Stack, Divider, Chip, MenuItem, CircularProgress } from "@mui/material";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";
import { PortSuppliers } from "../api_ports/api";

function generateClientSku() { let s = ""; for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10); return s; }
function peso(n) {
  if (n === "" || n === null || typeof n === "undefined") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}
const emptyForm = {
  product_name: "", sku: generateClientSku(), description: "", unit: "",
  stock: 0, cost_price: "", selling_price: "", supplier_id: "", supplier: "",
};

const swalError = (text) =>
  Swal.fire({
    icon: "error",
    title: "Validation",
    text,
    heightAuto: false,
    didOpen: () => {
      const c = Swal.getContainer?.();
      if (c) c.style.zIndex = "20000";
    },
  });

async function fetchSuppliers() {
  const res = await fetch(PortSuppliers, { method: "GET" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load suppliers");
  const arr = Array.isArray(data) ? data : data?.results || [];
  return arr.map((s) => ({
    id: s.supplier_id ?? s.id ?? s.ID ?? String(s.name ?? s.supplier_name),
    name: s.name ?? s.supplier_name ?? s.company_name ?? "Unnamed Supplier",
  }));
}


export default function ProductDialog({
  open,
  mode = "create",
  initialData = {},
  onClose,
  onSubmit,
  onSwitchToEdit,
}) {
  const [form, setForm] = useState({ ...emptyForm });

  // hydrate when dialog opens or initialData changes
  useEffect(() => {
    if (!open) return;
    setForm((prev) => ({
      ...emptyForm,
      ...initialData,
      sku:
        initialData?.sku && String(initialData.sku).trim() !== ""
          ? String(initialData.sku)
          : prev?.sku || generateClientSku(),
      stock: Number(initialData?.stock ?? emptyForm.stock),
      supplier_id: initialData?.supplier_id ?? "",
      supplier: initialData?.supplier ?? initialData?.supplier_name ?? "",
    }));
  }, [open, initialData]);

  const [suppliers, setSuppliers] = useState([]);
  const [supLoading, setSupLoading] = useState(false);
  const [supErr, setSupErr] = useState("");

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    (async () => {
      setSupLoading(true);
      setSupErr("");
      try {
        const list = await fetchSuppliers();
        if (!ignore) setSuppliers(list);
      } catch (e) {
        if (!ignore) setSupErr(e.message || "Failed to load suppliers.");
      } finally {
        if (!ignore) setSupLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [open]);

  const headerTitle = useMemo(() => (mode === "edit" ? "Edit Product" : mode === "view" ? "Product Details" : "Add Product"), [mode]);
  const readonly = mode === "view";

// FOrm Error Handler
  const validateForm = () => {
    if (!form.product_name?.trim()) return "Product Name is required.";
    if (!/^\d{10}$/.test(String(form.sku))) return "SKU must be a 10-digit number.";
    if (form.stock !== "" && Number(form.stock) < 0) return "Stock cannot be negative.";
    if (form.cost_price !== "" && Number(form.cost_price) < 0) return "Cost Price cannot be negative.";
    if (form.selling_price !== "" && Number(form.selling_price) < 0) return "Selling Price cannot be negative.";
    if (!form.supplier_id) return "Please select a supplier.";
    return null;
  };

  const selectedSupplierName = useMemo(() => {
    const found = suppliers.find((s) => String(s.id) === String(form.supplier_id));
    return found?.name || form.supplier || "";
  }, [suppliers, form.supplier_id, form.supplier]);

  const handleSubmit = async () => {
    const err = validateForm();
    if (err) { await swalError(err); return; }
    const payload = {
      product_name: form.product_name.trim(),
      sku: String(form.sku),
      description: form.description?.trim() || "",
      unit: form.unit?.trim() || "",
      stock: Number(form.stock ?? 0),
      cost_price: form.cost_price === "" ? null : Number(form.cost_price),
      selling_price: form.selling_price === "" ? null : Number(form.selling_price),
      supplier_id: form.supplier_id,
      supplier: selectedSupplierName || "",
    };
    await onSubmit?.(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={700} mr={2}>{headerTitle}</Typography>
        <IconButton onClick={onClose}><MdClose /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Product Name" value={form.product_name}
              onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
              fullWidth required disabled={readonly}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="SKU/Code (10 digits)" value={form.sku}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm((f) => ({ ...f, sku: v }));
              }}
              fullWidth required disabled={readonly}
              helperText={mode === "create" ? "Auto-generated. You can edit if needed." : ""}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description" value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth multiline minRows={2} disabled={readonly}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Unit (e.g., pcs, box)" value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              fullWidth disabled={readonly}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Current Stock" type="number" value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value === "" ? "" : Number(e.target.value) }))}
              fullWidth inputProps={{ min: 0 }} disabled={readonly}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select label="Supplier" value={form.supplier_id}
              onChange={(e) => {
                const id = e.target.value;
                const found = suppliers.find((s) => String(s.id) === String(id));
                setForm((f) => ({ ...f, supplier_id: id, supplier: found?.name || "" }));
              }}
              fullWidth disabled={readonly || supLoading}
              helperText={supErr ? supErr : supLoading ? "Loading suppliers…" : "Select a supplier"}
            >
              {supLoading && (
                <MenuItem value="" disabled>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={16} /><span>Loading…</span>
                  </Stack>
                </MenuItem>
              )}
              {!supLoading && suppliers.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Cost Price (₱)" type="number" value={form.cost_price}
              onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value === "" ? "" : Number(e.target.value) }))}
              fullWidth inputProps={{ min: 0, step: "0.01" }} disabled={readonly}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Selling Price (₱)" type="number" value={form.selling_price}
              onChange={(e) => setForm((f) => ({ ...f, selling_price: e.target.value === "" ? "" : Number(e.target.value) }))}
              fullWidth inputProps={{ min: 0, step: "0.01" }} disabled={readonly}
            />
          </Grid>
        </Grid>

        {mode === "view" && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip label={`Stock Status: ${Number(form.stock) <= 0 ? "Out of Stock" : Number(form.stock) <= 5 ? "Low" : "In Stock"}`} />
              <Chip label={`Cost: ${form.cost_price === "" ? "—" : peso(form.cost_price)}`} />
              <Chip label={`Price: ${form.selling_price === "" ? "—" : peso(form.selling_price)}`} />
              {form.supplier && <Chip label={`Supplier: ${form.supplier}`} />}
            </Stack>
          </>
        )}
      </DialogContent>

      <DialogActions>
        {mode === "view" ? (
          <Button variant="contained" onClick={onSwitchToEdit}>Edit</Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit}>
            {mode === "create" ? "Save" : "Update"}
          </Button>
        )}
        <Button onClick={onClose}><MdClose />&nbsp;Close</Button>
      </DialogActions>
    </Dialog>
  );
}
