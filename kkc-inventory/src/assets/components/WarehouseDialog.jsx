import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";

export default function WarehouseDialog({ open, onClose, onSubmit, warehouse, modal_type }) {
  const [form, setForm] = useState({ warehouse_id: "", warehouse_name: "", location: "" });
 
  useEffect(() => {
    if (modal_type === "Edit" && warehouse) {
      setForm({
        warehouse_id: warehouse.warehouse_id || "",
        warehouse_name: warehouse.warehouse_name || "",
        location: warehouse.location || "",
      });
    }  
  }, [modal_type, warehouse]);  


  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    const payload = {
      warehouse_id: form.warehouse_id,
      warehouse_name: form.warehouse_name.trim(),
      location: form.location.trim(),
    };
    onSubmit(payload); 
  };
 
  const handleClose = () => {
    setForm({ warehouse_id: "", warehouse_name: "", location: "" });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {modal_type === "Edit" ? "Edit Warehouse" : "Add Warehouse"}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Warehouse Name"
            name="warehouse_name"
            value={form.warehouse_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3fff" } }}
        >
          Save
        </Button>
        <Button onClick={handleClose} variant="text">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
