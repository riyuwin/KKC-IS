import React, { useEffect, useState } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, MenuItem } from "@mui/material";

function PayableDialog({ open, onClose, warehouses, onSubmit, modal_type, bill }) {
    const [formData, setFormData] = useState({
        client_merchant: "",
        user: "",
        due_date: "",
        company: "",
        type_of_bill: "",
        warehouse_id: "",
    });

    useEffect(() => {
        if (bill) {
            setFormData({
                payables_id: bill.payables_id || "", 
                client_merchant: bill.client_merchant || "",
                user: bill.user || "",
                due_date: bill.due_date || "",
                company: bill.company || "",
                type_of_bill: bill.type_of_bill || "",
                warehouse_id: bill.warehouse_id || "",
            });
        } else {
            setFormData({
                client_merchant: "",
                user: "",
                due_date: "",
                company: "",
                type_of_bill: "",
                warehouse_id: "",
            });
        }
    }, [bill]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        // ✅ ensure payables_id stays in payload
        const payload = { ...formData };
        console.log("Submitting data (dialog):", payload);
        onSubmit(payload, modal_type);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{modal_type === "Edit" ? "Edit Payable" : "Add Payable"}</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    margin="dense"
                    label="Client/Merchant"
                    name="client_merchant"
                    value={formData.client_merchant}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="User"
                    name="user"
                    value={formData.user}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Due Date"
                    name="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    label="Type of Bill"
                    name="type_of_bill"
                    value={formData.type_of_bill}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    select
                    margin="dense"
                    label="Warehouse"
                    name="warehouse_id"
                    value={formData.warehouse_id}
                    onChange={handleChange}
                >
                    {warehouses.map((w) => (
                        <MenuItem key={w.value} value={w.value}>
                            {w.label}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    {modal_type === "Edit" ? "Update" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default PayableDialog;
