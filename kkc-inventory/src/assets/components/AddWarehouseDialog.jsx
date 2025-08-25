import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";

export default function AddWarehouseDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", location: "", assignedUsers: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    const payload = {
      name: form.name.trim(),
      location: form.location.trim(),
      assignedUsers: form.assignedUsers
        ? form.assignedUsers.split(",").map(s => s.trim()).filter(Boolean)
        : [],
    };
    onSubmit(payload);
    setForm({ name: "", location: "", assignedUsers: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Warehouse</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Warehouse Name"
            name="name"
            value={form.name}
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
          {/* <TextField
            label="Assigned Users (comma-separated)"
            name="assignedUsers"
            value={form.assignedUsers}
            onChange={handleChange}
            fullWidth
            placeholder="e.g., Jane D., Mark T."
          /> */}
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
        <Button onClick={onClose} variant="text">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
