import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Grid, TextField, MenuItem, Button, InputAdornment, Stack, Chip
} from "@mui/material";
import { MdClose } from "react-icons/md";

function peso(n) {
  if (n === "" || n === null || typeof n === "undefined") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}

const DS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
];
const PS = [
  { value: 'Unpaid', label: 'Unpaid' },
  { value: 'Partially Paid', label: 'Partially Paid' },
  { value: 'Fully Paid', label: 'Fully Paid' },
];

export default function PurchaseDialog({
  open,
  mode = "create", // 'create' | 'edit' | 'view'
  initialData = {},
  suppliers = [],
  products = [],
  onClose,
  onSubmit,
  onSwitchToEdit,
}) {
  const [form, setForm] = useState({
    purchase_date: "",
    supplier_id: "",
    product_id: "",
    quantity: "",
    unit_cost: "",
    total_cost: "",
    purchase_status: "Pending",
    qty_received: "",
    payment_status: "Unpaid",
  });

  // ---------- initialize form on open ----------
  useEffect(() => {
    if (!open) return;
    setForm({
      purchase_date: initialData.purchase_date || "",
      supplier_id: initialData.supplier_id || "",
      product_id: initialData.product_id || "",
      quantity: initialData.quantity ?? "",
      unit_cost: initialData.unit_cost ?? "",
      total_cost: initialData.total_cost ?? "",
      purchase_status: initialData.purchase_status || "Pending",
      qty_received: initialData.qty_received ?? "",
      payment_status: initialData.purchase_payment_status || "Unpaid",
    });
  }, [open, initialData]);

  // ---------- filter products by selected supplier ----------
  const productsForSupplier = useMemo(() => {
    if (!form.supplier_id) return [];
    return products.filter(
      p => String(p.supplier_id) === String(form.supplier_id)
    );
  }, [products, form.supplier_id]);

  // Selected product (from filtered list)
  const selectedProduct = useMemo(
    () => productsForSupplier.find(p => String(p.product_id) === String(form.product_id)),
    [productsForSupplier, form.product_id]
  );

  // keep unit cost in sync with selected product
  useEffect(() => {
    if (!open) return;
    if (!selectedProduct) return;
    setForm(f => ({ ...f, unit_cost: selectedProduct?.cost_price ?? "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.product_id, selectedProduct?.cost_price, open]);

  // reset dependent fields when supplier changes
  useEffect(() => {
    if (!open) return;
    const stillValid =
      form.product_id &&
      productsForSupplier.some(p => String(p.product_id) === String(form.product_id));

    if (!stillValid) {
      setForm(f => ({ ...f, product_id: "", unit_cost: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.supplier_id, open]);

  // ---------- totals & remaining ----------
  const qty = Number(form.quantity || 0);
  const recv = Number(form.qty_received || 0);
  const ucost = Number(form.unit_cost || 0);
  const computedTotal = qty * ucost;
  const remaining = Math.max(0, qty - recv);

  useEffect(() => {
    setForm(f => ({ ...f, total_cost: computedTotal }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.quantity, form.unit_cost]);

  const disabled = mode === "view";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      // ⭐ CHANGE: portrait-ish, fixed content width that comfortably fits 3 columns
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: { xs: '95vw', sm: 900 },      // ⭐ CHANGE: ~900px so 3 inputs per line fit nicely
          maxWidth: '100%',
          maxHeight: '92vh',
          display: 'flex',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === "create" ? "Add Purchase" : mode === "edit" ? "Edit Purchase" : "View Purchase"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, pt: 2.5, pb: 2.5 }}>
        <Grid container spacing={2}>
          {/* ⭐ CHANGE: 3-per-row at md (md=4), 2-per-row at sm (sm=6), 1-per-row at xs */}
          {/* Row 1 */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Date"
              type="date"
              size="small"
              fullWidth
              value={form.purchase_date}
              onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
              disabled={disabled}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Supplier"
              size="small"
              fullWidth
              value={form.supplier_id}
              onChange={(e) => {
                const supplier_id = e.target.value;
                setForm(f => ({
                  ...f,
                  supplier_id,
                  product_id: "",   // ⭐ CHANGE: clear product on supplier change
                  unit_cost: ""     // ⭐ CHANGE: clear unit cost on supplier change
                }));
              }}
              disabled={disabled}
              // ⭐ CHANGE: keep height consistent even when helper text appears
              helperText=" "
            >
              {suppliers.map(s => (
                <MenuItem key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Product"
              size="small"
              fullWidth
              value={form.product_id}
              onChange={(e) => {
                const product_id = e.target.value;
                const prod = productsForSupplier.find(p => String(p.product_id) === String(product_id));
                setForm(f => ({
                  ...f,
                  product_id,
                  unit_cost: prod?.cost_price ?? ""  // ⭐ CHANGE: update cost immediately on product change
                }));
              }}
              disabled={disabled || !form.supplier_id}
              helperText={!form.supplier_id ? "Select supplier first" : productsForSupplier.length === 0 ? "No products for this supplier" : " "}
            >
              {productsForSupplier.map(p => (
                <MenuItem key={p.product_id} value={p.product_id}>
                  {p.product_name} {p.sku ? `(${p.sku})` : ""}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Quantity"
              size="small"
              fullWidth
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              disabled={disabled}
              inputProps={{ min: 0 }}
              helperText=" "
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Unit Cost"
              size="small"
              fullWidth
              type="number"
              value={form.unit_cost}
              onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
              disabled={disabled || !form.product_id}
              InputProps={{
                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
              }}
              helperText={!form.product_id ? "Pick a product to auto-fill" : " "}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Total Cost"
              size="small"
              fullWidth
              value={peso(computedTotal)}
              disabled
              helperText=" "
            />
          </Grid>

          {/* Row 3 */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Delivery Status"
              size="small"
              fullWidth
              value={form.purchase_status}
              onChange={(e) => setForm({ ...form, purchase_status: e.target.value })}
              disabled={disabled}
              helperText=" "
            >
              {DS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Qty. Received"
              size="small"
              fullWidth
              type="number"
              value={form.qty_received}
              onChange={(e) => setForm({ ...form, qty_received: e.target.value })}
              disabled={disabled}
              inputProps={{ min: 0, max: form.quantity || undefined }}
              helperText=" "
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              label="Payment Status"
              size="small"
              fullWidth
              value={form.payment_status}
              onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
              disabled={disabled}
              helperText=" "
            >
              {PS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Row 4 (2 items for clarity) */}
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              label="Remaining Products to be Received"
              size="small"
              fullWidth
              value={remaining}
              disabled
              helperText=" "
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
              <Chip
                size="small"
                color={remaining === 0 ? 'success' : 'warning'}
                label={remaining === 0 ? 'Completed' : 'Pending'}
              />
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {mode === 'view' ? (
          <Button onClick={onSwitchToEdit} variant="contained">Edit</Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                const payload = {
                  purchase_date: form.purchase_date,
                  supplier_id: form.supplier_id,
                  product_id: form.product_id,
                  quantity: Number(form.quantity || 0),
                  unit_cost: Number(form.unit_cost || 0),
                  qty_received: Number(form.qty_received || 0),
                  purchase_status: form.purchase_status,
                  purchase_payment_status: form.payment_status,
                };
                onSubmit?.(payload);
              }}
              disabled={!form.purchase_date || !form.supplier_id || !form.product_id || !form.quantity}
            >
              {mode === 'create' ? 'Add' : 'Save'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
