import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";

export default function EditWarehouseDialog({ open, onClose, onSubmit, warehouse }) {
    const [form, setForm] = useState({ warehouse_name: "", location: "" });
  
    useEffect(() => {
        if (warehouse) {
        setForm({
            warehouse_id: warehouse.warehouse_id || "",
            warehouse_name: warehouse.warehouse_name || "",
            location: warehouse.location || "",
        });
        }
    }, [warehouse]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = () => {
        const payload = {
            warehouse_id: warehouse.warehouse_id || "",
            warehouse_name: form.warehouse_name.trim(),
            location: form.location.trim(), 
        };
        onSubmit(payload);
        setForm({ warehouse_name: "", location: "" });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Edit Warehouse</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Warehouse Name"
                        name="name"
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
                <Button onClick={onClose} variant="text">Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
