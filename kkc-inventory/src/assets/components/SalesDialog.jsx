import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, TextField, MenuItem, Button, Box,
  Typography,
  Divider,
  Stack
} from "@mui/material";
import { MdClose, MdDelete } from "react-icons/md";
import AttachmentUploader from "./AttachmentsUploader";

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

/* WIP */
function bufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      bytes.subarray(i, i + chunkSize)
    );
  }
  return window.btoa(binary);
} 

export default function SalesDialog({ open, mode = "create", accountId, productsData = [], warehousesData = [], salesData, onClose, onSubmit, onSwitchToEdit, }) {
  const disabled = mode === "view";

  const [attachmentIsDisabled, setAttachmentIsDisabled] = useState(true);
  const [attachments, setAttachments] = useState([]);
 
  const [form, setForm] = useState({
    /* accountId: accountId, */
    warehouse_id: "",
    product_id: "",
    sale_date: "",
    customer_name: "",
    product_quantity: "",
    total_sale: "",
    sale_payment_status: "Partial",
    total_delivery_quantity: "",
    total_delivered: "",
    delivery_status: "Pending",
    attachments,
  });

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      total_sale: Number(form.total_sale || 0),
      attachments,
    };

    console.log("Submitting payload:", payload);
    onSubmit?.(payload);
    onClose();
  };

  const selectedProduct = productsData.find(p => p.product_id === form.product_id);

  useEffect(() => {
    const allRequiredFilled =
      form.warehouse_id &&
      form.product_id &&
      form.sale_date &&
      form.customer_name &&
      form.product_quantity &&
      form.total_delivery_quantity &&
      form.total_delivered;

    setAttachmentIsDisabled(!allRequiredFilled);

    console.log("All required filled?", allRequiredFilled);
  }, [form]);

  useEffect(() => {
    if (mode === "Edit" || mode === "View") {
      const normalizedAttachments = (salesData?.attachments || []).map((att) => {
        const base64String = bufferToBase64(att.file.data);
        return {
          ...att,
          previewUrl: `data:image/*;base64,${base64String}`,  
        };
      });

      setForm({
        warehouse_id: salesData?.sale?.warehouse_id,
        product_id: salesData?.sales_item?.product_id,
        sale_date: salesData?.sales_item?.sale_date,
        customer_name: salesData?.sale?.customer_name,
        product_quantity: salesData?.sales_item?.product_quantity,
        total_sale: salesData?.sale?.total_sale,
        sale_payment_status: salesData?.sale?.sale_payment_status,
        total_delivery_quantity: salesData?.deliveries?.total_delivery_quantity,
        total_delivered: salesData?.deliveries?.total_delivered,
        delivery_status: salesData?.sale?.delivery_status,
        attachments: normalizedAttachments,
      });

      setAttachments(normalizedAttachments);
    }
  }, [mode, salesData]);

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
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, minmax(0, 1fr))" },
            gap: 3,
          }}
        >
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Product Information
              </Typography>
              <Typography component="span" sx={{ color: "red", ml: 0.5 }}>
                *
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Box>
 
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
            label="Selling Price"
            size="small"
            fullWidth
            type="number"
            value={selectedProduct ? selectedProduct.selling_price : 0}
            onChange={handleChange("selling_price")}
            disabled={true}
            sx={fieldSx}
          />

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

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Sale Information
              </Typography>
              <Typography component="span" sx={{ color: "red", ml: 0.5 }}>
                *
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Box>


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
            label="Product Quantity Sold"
            size="small"
            fullWidth
            type="number"
            value={form.product_quantity}
            onChange={handleChange("product_quantity")}
            disabled={disabled}
            sx={fieldSx}
          />

          <TextField
            label="Total Sale"
            size="small"
            fullWidth
            type="number"
            value={selectedProduct ? selectedProduct.selling_price * form.product_quantity : 0}
            onChange={handleChange("total_sale")}
            disabled={true}
            sx={fieldSx}
          />

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

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Delivery Information
              </Typography>
              <Typography component="span" sx={{ color: "red", ml: 0.5 }}>
                *
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Box>

          <TextField
            label="Total Delivery Quantity"
            size="small"
            fullWidth
            type="number"
            value={form.total_delivery_quantity ? form.total_delivery_quantity : ""}
            onChange={handleChange("total_delivery_quantity")}
            disabled={disabled}
            sx={fieldSx}
          />

          <TextField
            label="Total of Successfully Delivered"
            size="small"
            fullWidth
            type="number"
            value={form.total_delivered ? form.total_delivered : ""}
            onChange={handleChange("total_delivered")}
            disabled={disabled}
            sx={fieldSx}
          />

          <TextField
            label="Remaining Product/s to be Delivered"
            size="small"
            fullWidth
            type="number"
            value={
              form.total_delivery_quantity && form.total_delivered
                ? form.total_delivery_quantity - form.total_delivered
                : form.total_delivery_quantity
            }
            onChange={handleChange("total_delivery_quantity")}
            disabled={true}
            InputProps={{ readOnly: true }}
            InputLabelProps={{ shrink: true }}
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

          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: "bold", mt: 2, mb: 0.5 }}>
              Attachment Details (Optional)
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Box> 

          <AttachmentUploader
            isDisabled={mode === "View" || mode === "View"  ? true : attachmentIsDisabled}
            attachments={attachments}
            onChange={setAttachments}
          />  
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
