import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem, } from "@mui/material";

const Bill_Types = ["Receivables", "Payables"];
const Bill_Status = ["Active", "Inactive"];

export default function PayableDialog({
  open,
  onClose,
  onSubmit,
  warehouses = [],
  bill,
  modal_type,
}) {
  const [form, setForm] = useState({
    client: "",
    user: "",
    due_date: "",
    company: "",
    type_bill: "",
    bill_status: "",
    warehouse_id: "",
  });
 
  useEffect(() => {
    if (modal_type === "Edit" && bill) {
      setForm({
        client: bill.client || "",
        user: bill.user || "",
        due_date: bill.due_date || "",
        company: bill.company || "",
        type_bill: bill.type_bill || "",
        bill_status: bill.bill_status || "",
        warehouse_id: bill.warehouse_id || "",
      });
    } else if (modal_type === "Add") {
      setForm({
        client: "",
        user: "",
        due_date: "",
        company: "",
        type_bill: "",
        bill_status: "",
        warehouse_id: "",
      });
    }
  }, [modal_type, bill]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    const payload = {
      client: form.client.trim(),
      user: form.user.trim(),
      due_date: form.due_date.trim(),
      company: form.company.trim(),
      type_bill: form.type_bill,
      bill_status: form.bill_status,
      warehouse_id: form.warehouse_id,
    };

    onSubmit(payload);

    setForm({
      client: "",
      user: "",
      due_date: "",
      company: "",
      type_bill: "",
      bill_status: "",
      warehouse_id: "",
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{modal_type} Bill</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Client/Merchant"
            name="client"
            type="text"
            value={form.client}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="User"
            name="user"
            type="text"
            value={form.user}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Due Date"
            name="due_date"
            type="date"
            value={form.due_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Company"
            name="company"
            type="text"
            value={form.company}
            onChange={handleChange}
            fullWidth
          /> 

          <FormControl fullWidth>
            <InputLabel id="bill-status-label">Bill Status</InputLabel>
            <Select
              labelId="bill-status-label"
              label="Bill Status"
              name="bill_status"
              value={form.bill_status}
              onChange={handleChange}
            >
              {Bill_Status.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="type-bill-label">Type of Bill</InputLabel>
            <Select
              labelId="type-bill-label"
              label="Type of Bill"
              name="type_bill"
              value={form.type_bill}
              onChange={handleChange}
            >
              {Bill_Types.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="wh-label">Assign to Warehouse</InputLabel>
            <Select
              labelId="wh-label"
              label="Assign to Warehouse"
              name="warehouse_id"
              value={form.warehouse_id}
              onChange={handleChange}
            >
              {warehouses.length === 0 ? (
                <MenuItem value="">No warehouses yet</MenuItem>
              ) : (
                warehouses.map((w) => (
                  <MenuItem
                    key={w.warehouse_id || w.value}
                    value={w.warehouse_id || w.value}
                  >
                    {w.warehouse_name || w.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ bgcolor: "#FA8201", "&:hover": { bgcolor: "#E67600" } }}
        >
          Save
        </Button>
        <Button onClick={onClose} variant="text">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
