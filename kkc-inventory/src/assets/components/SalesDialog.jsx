import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, MenuItem, Button, Box
} from "@mui/material";
import { MdClose } from "react-icons/md";

const DS = [
  { value: "Pending", label: "Pending" },
  { value: "Partially", label: "Partially" },
  { value: "Delivered", label: "Delivered" },
];

const PS = [
  { value: "Partial", label: "Partial" },
  { value: "Fully Paid", label: "Fully Paid" },
];

const fieldSx = {
"& .MuiInputBase-root": { minHeight: 40 },
"& .MuiFormHelperText-root": { minHeight: 20 },
"& .MuiFormLabel-root": { whiteSpace: "nowrap" },
};

export default function SalesDialog({ open, mode = "create", accountId, productsData = [], warehousesData = [], onClose, onSubmit, onSwitchToEdit, }) {
  const disabled = mode === "view";

  // form state
  const [form, setForm] = useState({
    accountId: accountId,
    product_id: "",
    warehouse_id: "",
    sale_date: "",
    customer_name: "",
    total_sale: "",
    delivery_status: "Pending",
    sale_payment_status: "Partial",
  }); 

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      total_sale: Number(form.total_sale || 0), 
    };

    /* console.log("Submitting payload:", payload);  */
    onSubmit?.(payload); 
    onClose(); 
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: { xs: "95vw", sm: 900 },
          maxWidth: "100%",
          maxHeight: "92vh",
          display: "flex",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {mode === "create"
          ? "Add Sale"
          : mode === "edit"
          ? "Edit Sale"
          : "View Sale"}
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, pt: 3, pb: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 3,
          }}
        >
          <TextField
            select
            label="Product"
            size="small"
            fullWidth
            value={form.product_id}
            onChange={handleChange("product_id")}
            disabled={disabled}
            sx={fieldSx}
          >
            {productsData.map((d) => (
              <MenuItem key={d.product_id} value={d.product_id}>
                {d.product_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Warehouse"
            size="small"
            fullWidth
            value={form.warehouse_id}
            onChange={handleChange("warehouse_id")}
            disabled={disabled}
            sx={fieldSx}
          >
            {warehousesData.map((d) => (
              <MenuItem key={d.warehouse_id} value={d.warehouse_id}>
                {d.warehouse_name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date"
            type="date"
            size="small"
            fullWidth
            value={form.sale_date}
            onChange={handleChange("sale_date")}
            disabled={disabled}
            sx={fieldSx}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Customer Name"
            size="small"
            fullWidth
            value={form.customer_name}
            onChange={handleChange("customer_name")}
            disabled={disabled}
            sx={fieldSx}
          />

          <TextField
            label="Total Sale"
            size="small"
            fullWidth
            type="number"
            value={form.total_sale}
            onChange={handleChange("total_sale")}
            disabled={disabled}
            sx={fieldSx}
          />

          <TextField
            select
            label="Delivery Status"
            size="small"
            fullWidth
            value={form.delivery_status}
            onChange={handleChange("delivery_status")}
            disabled={disabled}
            sx={fieldSx}
          >
            {DS.map((d) => (
              <MenuItem key={d.value} value={d.value}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Sale Payment Status"
            size="small"
            fullWidth
            value={form.sale_payment_status}
            onChange={handleChange("sale_payment_status")}
            disabled={disabled}
            sx={fieldSx}
          >
            {PS.map((d) => (
              <MenuItem key={d.value} value={d.value}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>

          <Box />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {mode === "view" ? (
          <Button onClick={onSwitchToEdit} variant="contained">
            Edit
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {mode === "create" ? "Add" : "Save"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
