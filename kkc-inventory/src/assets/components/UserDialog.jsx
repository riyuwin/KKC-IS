import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const ROLES = ["Admin", "Warehouse"];

export default function UserDialog({ open, onClose, onSubmit, warehouses = [], user, modal_type }) { 

  const [form, setForm] = useState({
    account_id: "",
    fullname: "",
    email: "",
    username: "",
    password: "",
    role: "",
    warehouse_id: "",
    added_at: "",
  });

  useEffect(() => {
    if (modal_type === "Edit" && user) {
      setForm({
        account_id: user.account_id || "",
        fullname: user.fullname || "",
        email: user.email || "",
        username: user.username || "",
        password: "",
        role: user.role || "",
        warehouse_id: user.warehouse_id || "",
        added_at: user.added_at || "",
      });
    } else if (modal_type === "Add") {
      setForm({
        account_id: "",
        fullname: "",
        email: "",
        username: "",
        password: "",
        role: "",
        warehouse_id: "",
        added_at: "",
      });
    }
  }, [modal_type, user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    const payload = {
      account_id: form.account_id,
      fullname: form.fullname.trim(),
      email: form.email.trim(),
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      warehouse_id: form.warehouse_id,
      added_at: form.added_at,
    };
    onSubmit(payload);
    setForm({
      account_id: "",
      fullname: "",
      email: "",
      username: "",
      password: "",
      role: "",
      warehouse_id: "",
      added_at: "",
    });
  }; 

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{modal_type} User / Account</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            name="fullname"
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
            label="Password"
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
              name="warehouse_id"
              value={form.warehouse_id}
              onChange={handleChange}
            >
              {warehouses.length === 0 ? (
                <MenuItem value="">No warehouses yet</MenuItem>
              ) : (
                warehouses.map((w) =>
                  modal_type === "Add" ? (
                    <MenuItem key={w.value} value={w.value}>
                      {w.label}
                    </MenuItem>
                  ) : (
                    <MenuItem key={w.warehouse_id} value={w.warehouse_id}>
                      {w.warehouse_name}
                    </MenuItem>
                  )
                )
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
        <Button onClick={onClose} variant="text">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
