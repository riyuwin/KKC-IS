import React, { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Stack, FormControl, InputLabel,
    Select, MenuItem
} from "@mui/material";

const Bill_Status = ["Pending", "Paid", "Overdue"];
const Payment_Modes = ["None", "Cash", "Online", "Check"];

export default function DueDatesDialog({
    open,
    onClose,
    onSubmit,
    bill = null,
    modal_type = "Add",
}) {
    const [form, setForm] = useState({
        due_date_id: "",
        payables_id: "",
        payment_status: "",
        payment_date: "",
        payment_mode: "",
        total_bill_amount: "",
    });

    // ✅ Populate fields for Edit/View
    useEffect(() => {
        if ((modal_type === "Edit" || modal_type === "View") && bill) {
            setForm({
                due_date_id: bill.due_date_id || "",
                payables_id: bill.payables_id || "",
                payment_status: bill.payment_status || "",
                payment_date: bill.payment_date || "",
                payment_mode: bill.payment_mode || "",
                total_bill_amount: bill.total_bill_amount || "",
            });
        } else {
            setForm({
                due_date_id: "",
                payables_id: "",
                payment_status: "",
                payment_date: "",
                payment_mode: "",
                total_bill_amount: "",
            });
        }
    }, [modal_type, bill]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
 
    const handleSave = () => {
        const payload = {
            due_date_id: form.due_date_id,
            /* due_date: form.due_date,   */
            payment_status: form.payment_status,
            payment_date: form.payment_date,
            payment_mode: form.payment_mode,
            total_bill_amount: form.total_bill_amount,
        };
        onSubmit(payload, modal_type);
        onClose();
    };

    const isView = modal_type === "View";

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{modal_type} Due Date</DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Payment Date"
                        name="payment_date"
                        type="date"
                        value={form.payment_date || ""}
                        onChange={handleChange}
                        fullWidth
                        disabled={isView}
                        InputLabelProps={{ shrink: true }}
                    />

                    <FormControl fullWidth disabled={isView}>
                        <InputLabel>Payment Status</InputLabel>
                        <Select
                            name="payment_status"
                            value={form.payment_status || ""}
                            onChange={handleChange}
                            label="Payment Status"
                        >
                            {Bill_Status.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={isView}>
                        <InputLabel>Mode of Payment</InputLabel>
                        <Select
                            name="payment_mode"
                            value={form.payment_mode || ""}
                            onChange={handleChange}
                            label="Mode of Payment"
                        >
                            {Payment_Modes.map((option) => (
                                <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Total Bill Amount"
                        name="total_bill_amount"
                        type="number"
                        value={form.total_bill_amount || ""}
                        onChange={handleChange}
                        fullWidth
                        disabled={isView}
                        InputLabelProps={{ shrink: true }}
                    />
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
