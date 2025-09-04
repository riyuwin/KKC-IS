import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, MenuItem, Button, InputAdornment, Stack, Chip, Box
} from "@mui/material";
import { MdClose } from "react-icons/md";

function peso(n) {
  if (n === "" || n === null || typeof n === "undefined") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}

// Default Date: Today
function todayYYYYMMDD() {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

  // Consistent field heights + reserve helper-text space so rows don't jump
  const fieldSx = {
    "& .MuiInputBase-root": { minHeight: 40 },
    "& .MuiFormHelperText-root": { minHeight: 20 },
    "& .MuiFormLabel-root": { whiteSpace: "nowrap" },
  };

  // Initialize form on open 
  useEffect(() => {
    if (!open) return;
    setForm({
      purchase_date: initialData.purchase_date || todayYYYYMMDD(),
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

  // Filter Products by selected Supplier
  const productsForSupplier = useMemo(() => {
    if (!form.supplier_id) return [];
    return products.filter(p => String(p.supplier_id) === String(form.supplier_id));
  }, [products, form.supplier_id]);

  // Selected product (from filtered list)
  const selectedProduct = useMemo(
    () => productsForSupplier.find(p => String(p.product_id) === String(form.product_id)),
    [productsForSupplier, form.product_id]
  );

  // Keep unit cost in sync with selected product
  useEffect(() => {
    if (!open) return;
    if (!selectedProduct) return;
    setForm(f => ({ ...f, unit_cost: selectedProduct?.cost_price ?? "" }));
  }, [form.product_id, selectedProduct?.cost_price, open]);

  // Reset dependent fields when supplier changes
  useEffect(() => {
    if (!open) return;
    const stillValid =
      form.product_id &&
      productsForSupplier.some(p => String(p.product_id) === String(form.product_id));
    if (!stillValid) {
      setForm(f => ({ ...f, product_id: "", unit_cost: "" }));
    }
  }, [form.supplier_id, open]);

  // Totals, remaining, and auto-complete delivery status
  const qty = Number(form.quantity || 0);
  const recv = Number(form.qty_received || 0);
  const ucost = Number(form.unit_cost || 0);
  const computedTotal = qty * ucost;
  const remaining = Math.max(0, qty - recv);

  useEffect(() => {
    setForm(f => ({ ...f, total_cost: computedTotal }));
  }, [form.quantity, form.unit_cost]);

  // Auto set delivery status based on qty vs received
  useEffect(() => {
    const want = qty > 0 && recv === qty ? "Completed" : "Pending";
    if (form.purchase_status !== want) {
      setForm(f => ({ ...f, purchase_status: want }));
    }
  }, [form.quantity, form.qty_received]);

  const disabled = mode === "view";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: { xs: '95vw', sm: 900 },
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
        {/* CSS Grid for equal columns */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <TextField
            label="Date"
            type="date"
            size="small"
            fullWidth
            value={form.purchase_date}
            onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
            disabled={disabled}
            InputLabelProps={{ shrink: true }}
            helperText=" "
            sx={fieldSx}
          />

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
                product_id: "",
                unit_cost: ""
              }));
            }}
            disabled={disabled}
            helperText=" "
            sx={fieldSx}
          >
            {suppliers.map(s => (
              <MenuItem key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</MenuItem>
            ))}
          </TextField>

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
                unit_cost: prod?.cost_price ?? ""
              }));
            }}
            disabled={disabled || !form.supplier_id}
            helperText=" "
            sx={fieldSx}
          >
            {productsForSupplier.map(p => (
              <MenuItem key={p.product_id} value={p.product_id}>
                {p.product_name} {p.sku ? `(${p.sku})` : ""}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Qty. Ordered"
            size="small"
            fullWidth
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            disabled={disabled}
            inputProps={{ min: 0 }}
            helperText=" "
            sx={fieldSx}
          />

          <TextField
            label="Unit Cost"
            size="small"
            fullWidth
            type="number"
            value={form.unit_cost}
            onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
            disabled={disabled || !form.product_id}
            InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
            helperText=" "
            sx={fieldSx}
          />

          <TextField
            label="Total Cost"
            size="small"
            fullWidth
            value={peso(computedTotal)}
            disabled
            helperText=" "
            sx={fieldSx}
          />

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
            sx={fieldSx}
          />

          <TextField
            select
            label="Delivery Status"
            size="small"
            fullWidth
            value={form.purchase_status}
            onChange={(e) => setForm({ ...form, purchase_status: e.target.value })}
            disabled={disabled}
            helperText=" "
            sx={fieldSx}
          >
            {DS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
          </TextField>

          <TextField
            select
            label="Payment Status"
            size="small"
            fullWidth
            value={form.payment_status}
            onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
            disabled={disabled}
            helperText=" "
            sx={fieldSx}
          >
            {PS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
          </TextField>

          <TextField
            label="Remaining Products to be Received"
            size="small"
            fullWidth
            value={remaining}
            disabled
            helperText=" "
            sx={fieldSx}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              minHeight: 40,
            }}
          >
            <Chip
              size="small" sx={{mt: -3}}
              color={form.purchase_status === 'Completed' ? 'success' : 'warning'}
              label={form.purchase_status === 'Completed' ? 'Completed' : 'Pending'}
            />
          </Box>

          <Box />
        </Box>
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
