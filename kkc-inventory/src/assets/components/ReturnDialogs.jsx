import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Stack, FormControlLabel, Checkbox, Typography
} from "@mui/material";
import {
  RetrieveProducts, RetrieveSuppliers, RetrieveCustomersFromSales
} from "../logics/returns/ManageReturns";

/**
 * Props:
 *  - mode: 'sales' | 'purchase'
 *  - open: boolean
 *  - onClose: fn
 *  - onSubmit: fn(payload)
 *  - initial: row or null (for edit)
 */
const REASONS = ["Wrong Item","Defective","Others"];
const today = () => new Date().toISOString().slice(0,10);

export default function ReturnDialog({ mode='sales', open, onClose, onSubmit, initial=null }) {
  const [date, setDate] = useState(today());
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Defective");
  const [customerName, setCustomerName] = useState("");   // sales only
  const [confirmed, setConfirmed] = useState(false);

  const [productOpts, setProductOpts] = useState([]);     // [{label, value, supplier_id, supplier_name}]
  const [customerOpts, setCustomerOpts] = useState([]);   // sales only

  // Filled from product selection (purchase mode: supplier is auto, read-only)
  const selectedProduct = useMemo(
    () => productOpts.find(p => p.value === Number(productId)) || null,
    [productOpts, productId]
  );
  const supplierName = selectedProduct?.supplier_name || "";
  const supplierId = selectedProduct?.supplier_id || null;

  useEffect(() => {
    (async () => {
      const productsRaw = await fetchProductsWithSupplier();
      setProductOpts(productsRaw);

      if (mode === "sales") {
        const customers = await RetrieveCustomersFromSales();
        setCustomerOpts(customers);
      }
    })();
  }, [mode]);

  useEffect(() => {
    // default values on open / when switching edit vs add
    if (open) {
      if (initial) {
        setDate(initial.sale_return_date?.slice(0,10) || initial.purchase_return_date?.slice(0,10) || initial.date?.slice(0,10) || today());
        setProductId(initial.product_id || "");
        setQuantity(initial.quantity || 1);
        setReason(initial.reason || "Defective");
        setCustomerName(initial.customer_name || "");      // ignored in purchase mode
        setConfirmed(!!initial.confirmed);
      } else {
        setDate(today());
        setProductId("");
        setQuantity(1);
        setReason("Defective");
        setCustomerName("");
        setConfirmed(false);
      }
    }
  }, [open, initial]);

  // Products endpoint you already have returns supplier info — we normalize it here
  async function fetchProductsWithSupplier() {
    const res = await fetch(import.meta.env.VITE_API_PRODUCTS);
    const data = await res.json();
    return data.map(p => ({
      label: `${p.product_name} (${p.sku})`,
      value: p.product_id,
      supplier_id: p.supplier_id || null,
      supplier_name: p.supplier_name || ""
    }));
  }

  const handleSave = () => {
    if (!date || !productId || !quantity || !reason) return;

    if (mode === "sales") {
      if (!customerName) return;
      onSubmit({
        sale_return_date: date,
        product_id: Number(productId),
        quantity: Number(quantity),
        reason,
        customer_name: customerName,
        confirmed
      });
    } else {
      // purchase mode (auto supplier)
      onSubmit({
        purchase_return_date: date,
        product_id: Number(productId),
        quantity: Number(quantity),
        reason,
        supplier_id: supplierId,   // auto from product
        confirmed
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "sales" ? "Sales Return" : "Purchase Return"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e)=>setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField select label="Product" value={productId} onChange={(e)=>setProductId(e.target.value)}>
            {productOpts.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e)=>setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <TextField select label="Reason" value={reason} onChange={(e)=>setReason(e.target.value)}>
            {REASONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
          </TextField>

          {mode === "sales" ? (
            <TextField
              select
              label="Customer/Company"
              value={customerName}
              onChange={(e)=>setCustomerName(e.target.value)}
            >
              {customerOpts.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
          ) : (
            <TextField
              label="Supplier"
              value={supplierName || "(no supplier on product)"}
              InputProps={{ readOnly: true }}
            />
          )}

          <FormControlLabel
            control={<Checkbox checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} />}
            label="Confirmed (update stock + record movement now)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
