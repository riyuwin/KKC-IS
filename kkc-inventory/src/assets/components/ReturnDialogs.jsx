import React, { useEffect, useMemo, useState } from "react";
import {Dialog, DialogTitle, DialogContent, DialogActions,Button, TextField, MenuItem, Stack, FormControlLabel, Checkbox, Typography} from "@mui/material";

import { RetrieveProductsWithSupplier, RetrieveSuppliers, RetrieveCustomersFromSales, } from "../logics/returns/ManageReturns";

const REASONS = ["Wrong Item", "Defective", "Others"];
const today = () => new Date().toISOString().slice(0, 10);

export default function ReturnDialog({
  mode = "sales",
  open,
  onClose,
  onSubmit,
  initial = null,
  warehouseId = "all", // <-- for admin filter (warehouse dropdown)
}) {
  const [date, setDate] = useState(today());
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("Defective");
  const [customerName, setCustomerName] = useState(""); // sales only
  const [confirmed, setConfirmed] = useState(false);

  const [supplierId, setSupplierId] = useState(""); // purchase only
  const [supplierOpts, setSupplierOpts] = useState([]);
  const [productOpts, setProductOpts] = useState([]);
  const [customerOpts, setCustomerOpts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  const selectedProduct = useMemo(
    () => productOpts.find((p) => String(p.value) === String(productId)) || null,
    [productOpts, productId]
  );

  const supplierName = selectedProduct?.supplier_name || "";
  const autoSupplierId = selectedProduct?.supplier_id || null;

  // filtered products for purchase mode (by supplier)
  const visibleProducts = useMemo(() => {
    if (mode !== "purchase") return productOpts;
    if (!supplierId) return [];
    return productOpts.filter((p) => String(p.supplier_id || "") === String(supplierId));
  }, [mode, productOpts, supplierId]);

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setLoading(true);
        setLoadErr("");

        const [products, suppliers] = await Promise.all([
          RetrieveProductsWithSupplier(warehouseId),
          RetrieveSuppliers(),
        ]);

        setProductOpts(Array.isArray(products) ? products : []);
        setSupplierOpts(Array.isArray(suppliers) ? suppliers : []);

        if (mode === "sales") {
          const customers = await RetrieveCustomersFromSales(warehouseId);
          setCustomerOpts(Array.isArray(customers) ? customers : []);
        } else {
          setCustomerOpts([]);
        }
      } catch (e) {
        setLoadErr(e?.message || "Failed to load dropdowns");
        setProductOpts([]);
        setSupplierOpts([]);
        setCustomerOpts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, mode, warehouseId]);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setDate(
        initial.sale_return_date?.slice(0, 10) ||
          initial.purchase_return_date?.slice(0, 10) ||
          initial.date?.slice(0, 10) ||
          today()
      );
      setProductId(initial.product_id || "");
      setQuantity(initial.quantity || 1);
      setReason(initial.reason || "Defective");
      setCustomerName(initial.customer_name || "");
      setConfirmed(!!initial.confirmed);

      setSupplierId(initial.supplier_id || "");
    } else {
      setDate(today());
      setProductId("");
      setQuantity(1);
      setReason("Defective");
      setCustomerName("");
      setConfirmed(false);
      setSupplierId("");
    }
  }, [open, initial]);

  useEffect(() => {
    if (mode !== "purchase") return;
    if (!open) return;
    if (!productId) return;

    if (!supplierId && autoSupplierId) {
      setSupplierId(String(autoSupplierId));
    }
  }, [mode, open, productId, autoSupplierId, supplierId]);

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
        confirmed,
      });
    } else {
      // purchase mode
      if (!supplierId) return;
      onSubmit({
        purchase_return_date: date,
        product_id: Number(productId),
        quantity: Number(quantity),
        reason,
        supplier_id: Number(supplierId),
        confirmed,
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "sales" ? "Sales Return" : "Purchase Return"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          {loadErr ? (
            <Typography color="error" variant="body2">
              {loadErr}
            </Typography>
          ) : null}

          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />

          {mode === "purchase" ? (
            <TextField
              select
              label="Supplier"
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setProductId("");
              }}
              disabled={loading}
              helperText="Select supplier first to filter products"
            >
              {supplierOpts.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          ) : null}

          <TextField
            select
            label="Product"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={loading || (mode === "purchase" && !supplierId)}
            helperText={mode === "purchase" && !supplierId ? "Choose a supplier first" : ""}
          >
            {(mode === "purchase" ? visibleProducts : productOpts).map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
            disabled={loading}
          />

          <TextField select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} disabled={loading}>
            {REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>

          {mode === "sales" ? (
            <TextField
              select
              label="Customer/Company"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={loading}
            >
              {customerOpts.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              label="Supplier (auto)"
              value={supplierName || "(supplier from selected product)"}
              InputProps={{ readOnly: true }}
              disabled
            />
          )}

          <FormControlLabel
            control={<Checkbox checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />}
            label="Confirmed (update stock + record movement now)"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
