import React, { useEffect, useState } from "react";
import { Card, CardContent, Stack, TextField, MenuItem, Chip, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Typography, Button, InputAdornment, Box, Tooltip, ListItemText, Divider, } from "@mui/material";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import AttachmentUploader from "./AttachmentsUploader";

export default function SalesEditorLeft({
    // header
    salesDate,
    setSalesDate,
    supplierId,
    setSupplierId,
    paymentStatus,
    setPaymentStatus,
    suppliers,
    productsForSupplier,
    globalStatus,
    PS,
    DS,
    // VAT
    vatMode,
    setVatMode,
    vatOptions,

    // add-line
    selectedCustomerName,
    selectedWarehouseId,
    pId,
    qty,
    unit,
    recv,
    onSelectProduct,
    setSelectedCustomerName,
    setSelectedWarehouseId,
    setQty,
    setUnit,
    setRecv,
    addTotal,
    addRemain,
    addStatus,
    onAddLine,

    // editing
    editingId,
    onEditLine,

    // table
    lines,
    onUpdateCell,
    onRemoveLine,
    grandTotal,

    // styling & utils
    fieldSx,
    peso,
}) {
    const [warehouses, setWarehouses] = useState([]);
    const [customerName, setCustomerName] = useState();
    const [warehouseSelected, setWarehouseSelected] = useState();
    
    const mode = "Add"
    const disabled = mode === "view";
    
    const [attachmentIsDisabled, setAttachmentIsDisabled] = useState(true);
    const [attachments, setAttachments] = useState([]);

    const selectCommon = {
        displayEmpty: true,
        MenuProps: { PaperProps: { style: { maxHeight: 48 * 6 } } },
    };

    // Prevent Select (and TextField) value text from expanding the field
    const ellipsisSelectSx = {
        "& .MuiSelect-select": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
        },
        "& .MuiOutlinedInput-input": {
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
        },
    };

    const renderValueEllipsis = (text) => (
        <Box
            sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            {text}
        </Box>
    );

    const vatSelectOptions = vatOptions || [];

    const ellipsisTextSx = {
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const isEditing = Boolean(editingId);


    // Data Fetcher 
    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Warehouses
                const { data: warehouseData } = await RetrieveWarehouse();
                setWarehouses(warehouseData);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchAll();
        const interval = setInterval(fetchAll, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Stack spacing={3} sx={{ maxWidth: "100%", minWidth: 0 }}>
            {/* Header */}
            <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* FIXED 2-COLUMN LAYOUT */}
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                            },
                            columnGap: 2,
                            rowGap: 2,
                            alignItems: "center",
                        }}
                    >

                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                label="Customer Name"
                                size="small"
                                type="text"
                                value={selectedCustomerName}
                                onChange={(e) => setSelectedCustomerName(e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={fieldSx}
                            />
                        </Box>


                        {/* Row 1: Date | Supplier */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                size="small"
                                value={salesDate}
                                onChange={(e) => setSalesDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldSx}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                select
                                label="Supplier"
                                size="small"
                                value={supplierId}
                                onChange={(e) => {
                                    setSupplierId(e.target.value);
                                }}
                                SelectProps={{
                                    ...selectCommon,
                                    renderValue: (v) => {
                                        if (!v)
                                            return renderValueEllipsis("Select supplier…");
                                        const sel = suppliers.find(
                                            (s) => String(s.supplier_id) === String(v)
                                        );
                                        return renderValueEllipsis(
                                            sel?.supplier_name || "Select supplier…"
                                        );
                                    },
                                }}
                                placeholder="Select supplier…"
                                InputLabelProps={{ shrink: true }}
                                sx={{ ...fieldSx, ...ellipsisSelectSx }}
                            >
                                <MenuItem disabled value="">
                                    <em>Select Supplier…</em>
                                </MenuItem>
                                {suppliers.map((s) => (
                                    <MenuItem key={s.supplier_id} value={s.supplier_id}>
                                        <Tooltip title={s.supplier_name}>
                                            <ListItemText
                                                primaryTypographyProps={{ noWrap: true }}
                                                primary={s.supplier_name}
                                            />
                                        </Tooltip>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Row 2: Payment Status | VAT */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                select
                                label="Warehouse"
                                size="small"
                                value={selectedWarehouseId}
                                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                                SelectProps={{
                                    ...selectCommon,
                                    renderValue: (v) => {
                                        if (!v) return renderValueEllipsis("Select warehouse");
                                        const sel = warehouses.find(
                                            (w) => String(w.warehouse_id) === String(v)
                                        );
                                        return renderValueEllipsis(sel?.warehouse_name || "Select warehouse");
                                    },
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{ ...fieldSx, ...ellipsisSelectSx }}
                            >
                                <MenuItem disabled value="">
                                    <em>Select warehouse…</em>
                                </MenuItem>

                                {warehouses.map((w) => (
                                    <MenuItem key={w.warehouse_id} value={w.warehouse_id}>
                                        {w.warehouse_name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>



                        {/* Row 2: Payment Status | VAT */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                select
                                label="Payment Status"
                                size="small"
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                                SelectProps={{
                                    ...selectCommon,
                                    renderValue: (v) =>
                                        renderValueEllipsis(
                                            PS.find((p) => p.value === v)?.label ||
                                            "Select payment status…"
                                        ),
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{ ...fieldSx, ...ellipsisSelectSx }}
                            >
                                {PS.map((p) => (
                                    <MenuItem key={p.value} value={p.value}>
                                        {p.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                select
                                label="VAT"
                                size="small"
                                value={vatMode}
                                onChange={(e) => setVatMode(e.target.value)}
                                SelectProps={{
                                    ...selectCommon,
                                    renderValue: (v) =>
                                        renderValueEllipsis(
                                            vatSelectOptions.find(
                                                (opt) => String(opt.value) === String(v)
                                            )?.label || "Select VAT…"
                                        ),
                                }}
                                InputLabelProps={{ shrink: true }}
                                sx={{ ...fieldSx, ...ellipsisSelectSx }}
                            >
                                {vatSelectOptions.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Row 3: Delivery Status | empty placeholder to keep 2-per-row */}
                        <Box sx={{ minWidth: 0 }}>
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                sx={{ minHeight: 44, width: "100%" }}
                            >
                                <Typography color="text.secondary">
                                    Delivery Status:
                                </Typography>
                                <Chip
                                    size="small"
                                    color={
                                        globalStatus === "Completed" ? "success" : "warning"
                                    }
                                    label={globalStatus}
                                />
                            </Stack>
                        </Box>

                        <Box sx={{ minWidth: 0 }} />
                    </Box>
                </CardContent>
            </Card>

            {/* Add Product – fixed 2-column layout */}
            <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                            },
                            columnGap: 2,
                            rowGap: 2,
                            alignItems: "center",
                        }}
                    >
                        {/* Row 1: Product | Qty Ordered */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                select
                                disabled={!supplierId}
                                label="Product"
                                size="small"
                                value={pId}
                                onChange={onSelectProduct}
                                SelectProps={{
                                    ...selectCommon,
                                    renderValue: (v) => {
                                        if (!v)
                                            return renderValueEllipsis("Select product…");
                                        const sel = productsForSupplier.find(
                                            (p) => String(p.product_id) === String(v)
                                        );
                                        const name = sel?.product_name || "";
                                        const sku = sel?.sku ? ` (${sel.sku})` : "";
                                        return renderValueEllipsis(`${name}${sku}`);
                                    },
                                }}
                                placeholder="Select product…"
                                InputLabelProps={{ shrink: true }}
                                sx={{ ...fieldSx, ...ellipsisSelectSx }}
                            >
                                <MenuItem disabled value="">
                                    <em>Select product…</em>
                                </MenuItem>
                                {productsForSupplier.map((p) => (
                                    <MenuItem
                                        key={p.product_id}
                                        value={String(p.product_id)}
                                    >
                                        <Tooltip
                                            title={`${p.product_name}${p.sku ? ` (${p.sku})` : ``
                                                }`}
                                        >
                                            <ListItemText
                                                primaryTypographyProps={{ noWrap: true }}
                                                secondaryTypographyProps={{ noWrap: true }}
                                                primary={p.product_name}
                                                secondary={
                                                    p.sku ? `SKU: ${p.sku}` : undefined
                                                }
                                            />
                                        </Tooltip>
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                label="Qty. Ordered"
                                size="small"
                                type="number"
                                value={qty}
                                onChange={(e) => setQty(e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={fieldSx}
                            />
                        </Box>

                        {/* Row 2: Qty Received | Unit Cost */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                label="Qty. Received"
                                size="small"
                                type="number"
                                value={recv}
                                onChange={(e) => setRecv(e.target.value)}
                                inputProps={{ min: 0, max: Number(qty) || undefined }}
                                sx={fieldSx}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                label="Unit Cost"
                                size="small"
                                type="number"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                disabled
                                sx={fieldSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">₱</InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* Row 3: Total Cost | Delivery Status */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                label="Total Cost"
                                size="small"
                                value={peso(addTotal)}
                                disabled
                                sx={fieldSx}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                select
                                label="Delivery Status"
                                size="small"
                                value={addStatus}
                                disabled
                                sx={fieldSx}
                            >
                                {DS.map((d) => (
                                    <MenuItem key={d.value} value={d.value}>
                                        {d.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>

                        {/* Row 4: Remaining | Chip + Add/Update button */}
                        <Box sx={{ minWidth: 0 }}>
                            <TextField
                                fullWidth
                                label="Remaining to Receive"
                                size="small"
                                value={addRemain}
                                disabled
                                sx={fieldSx}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                sx={{ minHeight: 44 }}
                            >
                                <Chip
                                    size="small"
                                    color={addStatus === "Completed" ? "success" : "warning"}
                                    label={addStatus}
                                />
                                <Box sx={{ flex: 1 }} />
                                <Button
                                    startIcon={<MdAdd />}
                                    variant="contained"
                                    onClick={onAddLine}
                                    disabled={!pId || !Number(qty)}
                                    sx={{ minWidth: 140 }}
                                >
                                    {isEditing ? "Update Item" : "Add Product"}
                                </Button>
                            </Stack>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Items Table */}
            <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0, paddingLeft: 3, paddingRight: 3 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ width: "100%", overflowX: "hidden" }}>

                        {/* Header */}
                        <Box sx={{ gridColumn: "1 / -1" }}>
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold", mt: 2, mb: 0.5 }}
                            >
                                Attachment Details (Optional)
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </Box>

                        {/* Attachment Uploader */}
                        <AttachmentUploader
                            isDisabled={mode === "View" ? true : attachmentIsDisabled}
                            attachments={attachments}
                            onChange={setAttachments}
                        />

                    </Box>
                </CardContent>
            </Card>


            {/* Items Table */}
            <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
                <CardContent sx={{ p: 0 }}>
                    <Box sx={{ width: "100%", overflowX: "hidden" }}>
                        <Table
                            size="small"
                            sx={{
                                tableLayout: "fixed",
                                width: "100%",
                                "& th, & td": { px: 1 },
                            }}
                        >
                            <colgroup>
                                <col style={{ width: "15%" }} /> {/* Supplier */}
                                <col style={{ width: "15%" }} /> {/* Product */}
                                <col style={{ width: "10%" }} /> {/* Qty Ordered */}
                                <col style={{ width: "10%" }} /> {/* Qty Received */}
                                <col style={{ width: "10%" }} /> {/* Unit ₱ */}
                                <col style={{ width: "10%" }} /> {/* Remaining */}
                                <col style={{ width: "10%" }} /> {/* Status */}
                                <col style={{ width: "10%" }} /> {/* Total ₱ */}
                                <col style={{ width: "10%" }} /> {/* Actions */}
                            </colgroup>

                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Supplier</TableCell>
                                    <TableCell align="center">Product</TableCell>
                                    <TableCell align="center">Qty Ordered</TableCell>
                                    <TableCell align="center">Qty Received</TableCell>
                                    <TableCell align="center">Unit ₱</TableCell>
                                    <TableCell align="center">Remaining</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Total ₱</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {lines.map((l) => {
                                    const q = Number(l.quantity || 0);
                                    const r = Number(l.qty_received || 0);
                                    const u = Number(l.unit_cost || 0);
                                    const remain = Math.max(0, q - r);
                                    const status = q > 0 && r === q ? "Completed" : "Pending";
                                    const lineTotal = q * u;

                                    const supplier =
                                        suppliers.find(
                                            (s) =>
                                                String(s.supplier_id) === String(l.supplier_id)
                                        ) || null;
                                    const supplierName = supplier?.supplier_name || "";

                                    return (
                                        <TableRow key={l.temp_id}>
                                            <TableCell align="center" sx={{ minWidth: 0 }}>
                                                <Typography
                                                    noWrap
                                                    title={supplierName}
                                                    sx={ellipsisTextSx}
                                                >
                                                    {supplierName}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center" sx={{ minWidth: 0 }}>
                                                <Typography
                                                    noWrap
                                                    title={l.product_name}
                                                    sx={ellipsisTextSx}
                                                >
                                                    {l.product_name}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" sx={ellipsisTextSx}>
                                                    {q}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" sx={ellipsisTextSx}>
                                                    {r}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" sx={ellipsisTextSx}>
                                                    {peso(u)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" sx={ellipsisTextSx}>
                                                    {remain}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Chip
                                                    size="small"
                                                    color={status === "Completed" ? "success" : "warning"}
                                                    label={status}
                                                />
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography variant="body2" sx={ellipsisTextSx}>
                                                    {peso(lineTotal)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent="center"
                                                >
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            color="primary"
                                                            size="small"
                                                            onClick={() => onEditLine && onEditLine(l)}
                                                        >
                                                            <MdEdit />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => onRemoveLine(l.temp_id)}
                                                            size="small"
                                                        >
                                                            <MdDelete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {lines.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9}>
                                            <Box sx={{ p: 3 }}>
                                                <Typography color="text.secondary" align="center">
                                                    No items yet. Add a product above.
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {lines.length > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} />
                                        <TableCell align="center">
                                            <b>Grand Total</b>
                                        </TableCell>
                                        <TableCell align="center">
                                            <b>{peso(grandTotal)}</b>
                                        </TableCell>
                                        <TableCell />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </CardContent>
            </Card>
        </Stack>
    );
}
