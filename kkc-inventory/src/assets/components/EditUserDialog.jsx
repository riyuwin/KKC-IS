import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const ROLES = ["Admin", "Warehouse"];

export default function EditUserDialog({ open, onClose, onSubmit, warehouses = [], user }) {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    username: "",
    password: "",
    role: "",
    warehouse: "",
  });

  // kapag may binigay na user, i-load sa form
  useEffect(() => {
    if (user) {
      setForm({
        fullname: user.fullname || "",
        email: user.email || "",
        username: user.username || "",
        password: "", // optional: wag auto-fill password for security
        role: user.role || "",
        warehouse: user.warehouse_id || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpdate = () => {
    const payload = {
      id: user.id, // importante para sa update API
      fullName: form.fullname.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password, // optional kung may ilalagay
      role: form.role,
      warehouse: form.warehouse,
    };
    onSubmit(payload); // call parent handler
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit User / Account</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            name="fullName"
            value={form.fullname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Password (leave blank to keep current)"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="wh-label">Assign to Warehouse</InputLabel>
            <Select
              labelId="wh-label"
              label="Assign to Warehouse"
              name="warehouse"
              value={form.warehouse}
              onChange={handleChange}
            >
              {warehouses.length === 0 ? (
                <MenuItem value="">No warehouses yet</MenuItem>
              ) : (
                warehouses.map((w) => (
                  <MenuItem key={w.label} value={w.value}>
                    {w.label}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleUpdate}
          variant="contained"
          sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#125aa0" } }}
        >
          Update
        </Button>
        <Button onClick={onClose} variant="text">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
