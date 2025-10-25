import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, FormControl, InputLabel,
  Select, MenuItem
} from "@mui/material";

const Bill_Types = ["Receivables", "Payables"];
const Bill_Status = ["Active", "Inactive"];

export default function PayableDialog({
  open,
  onClose,
  onSubmit,
  warehouses = [],
  bill = null,
  modal_type = "Add",
}) {
  const [form, setForm] = useState({
    payables_id: "",
    client_merchant: "",
    user: "",
    due_date: "",
    company: "",
    type_of_bill: "",
    bill_status: "",
    warehouse_id: "",
  });

  // ✅ Populate form for Edit *and* View
  useEffect(() => {
    if ((modal_type === "Edit" || modal_type === "View") && bill) {
      setForm({
        payables_id: bill.payables_id || "",
        client_merchant: bill.client_merchant || "",
        user: bill.user || "",
        due_date: bill.due_date || "",
        company: bill.company || "",
        type_of_bill: bill.type_of_bill || "",
        bill_status: bill.bill_status || "",
        warehouse_id: bill.warehouse_id || "",
      });
    } else {
      setForm({
        payables_id: "",
        client_merchant: "",
        user: "",
        due_date: "",
        company: "",
        type_of_bill: "",
        bill_status: "",
        warehouse_id: "",
      });
    }
  }, [modal_type, bill]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    const payload = {
      ...form,
      client_merchant: form.client_merchant.trim(),
      user: form.user.trim(),
      company: form.company.trim(),
    };

    onSubmit(payload, modal_type);
    onClose();
  };

  const isView = modal_type === "View";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{modal_type} Bill</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {(modal_type === "Edit" || modal_type === "View") && (
            <TextField
              label="Payables ID"
              name="payables_id"
              value={form.payables_id}
              fullWidth
              disabled
            />
          )}

          <TextField
            label="Client/Merchant"
            name="client_merchant"
            value={form.client_merchant}
            onChange={handleChange}
            fullWidth
            disabled={isView}
          />

          <TextField
            label="User"
            name="user"
            value={form.user}
            onChange={handleChange}
            fullWidth
            disabled={isView}
          />

          <TextField
            label="Due Date"
            name="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={isView}
          />

          <TextField
            label="Company"
            name="company"
            value={form.company}
            onChange={handleChange}
            fullWidth
            disabled={isView}
          />

          <FormControl fullWidth disabled={isView}>
            <InputLabel id="bill-status-label">Bill Status</InputLabel>
            <Select
              labelId="bill-status-label"
              name="bill_status"
              value={form.bill_status}
              onChange={handleChange}
              label="Bill Status"
            >
              {Bill_Status.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={isView}>
            <InputLabel id="type-bill-label">Type of Bill</InputLabel>
            <Select
              labelId="type-bill-label"
              name="type_of_bill"
              value={form.type_of_bill}
              onChange={handleChange}
              label="Type of Bill"
            >
              {Bill_Types.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={isView}>
            <InputLabel id="wh-label">Assign to Warehouse</InputLabel>
            <Select
              labelId="wh-label"
              name="warehouse_id"
              value={form.warehouse_id}
              onChange={handleChange}
              label="Assign to Warehouse"
            >
              {warehouses.length === 0 ? (
                <MenuItem value="">No warehouses available</MenuItem>
              ) : (
                warehouses.map((w) => (
                  <MenuItem key={w.value} value={w.value}>
                    {w.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        {!isView && (
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: "#FA8201", "&:hover": { bgcolor: "#E67600" } }}
          >
            Save
          </Button>
        )}
        <Button onClick={onClose} variant="text">
          {isView ? "Close" : "Cancel"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
