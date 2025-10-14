import React from "react";
import {
  Card, CardContent, Grid, Stack, TextField, MenuItem, Chip,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Typography, Button, InputAdornment, Box, Tooltip, ListItemText
} from "@mui/material";
import { MdAdd, MdDelete } from "react-icons/md";

export default function PurchaseEditorLeft({
  // header
  purchaseDate, setPurchaseDate,
  supplierId, setSupplierId,
  paymentStatus, setPaymentStatus,
  suppliers, productsForSupplier,
  globalStatus,
  PS, DS,

  // add-line
  pId, qty, unit, recv,
  onSelectProduct, setQty, setUnit, setRecv,
  addTotal, addRemain, addStatus,
  onAddLine,

  // table
  lines, onUpdateCell, onRemoveLine, grandTotal,

  // styling & utils
  fieldSx, peso,
}) {
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
    <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {text}
    </Box>
  );

  

  return (
    <Stack spacing={3} sx={{ maxWidth: "100%", minWidth: 0 }}>
      {/* Header */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Row 1: Date | Supplier */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                size="small"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                select
                label="Supplier"
                size="small"
                value={supplierId}
                onChange={(e) => { setSupplierId(e.target.value); }}
                SelectProps={{
                  ...selectCommon,
                  renderValue: (v) => {
                    if (!v) return renderValueEllipsis("Select supplier…");
                    const sel = suppliers.find(s => String(s.supplier_id) === String(v));
                    return renderValueEllipsis(sel?.supplier_name || "Select supplier…");
                  }
                }}
                placeholder="Select supplier…"
                InputLabelProps={{ shrink: true }}
                sx={{ ...fieldSx, ...ellipsisSelectSx }}
              >
                <MenuItem disabled value="">
                  <em>Select supplier…</em>
                </MenuItem>
                {suppliers.map(s => (
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
            </Grid>

            {/* Row 2: Payment Status | Delivery Chip */}
            <Grid item xs={12} sm={6} sx={{ minWidth: 0 }}>
              <TextField
                fullWidth
                select
                label="Payment Status"
                size="small"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                SelectProps={{
                  ...selectCommon,
                  renderValue: (v) => renderValueEllipsis(PS.find(p => p.value === v)?.label || "Select payment status…")
                }}
                InputLabelProps={{ shrink: true }}
                sx={{ ...fieldSx, ...ellipsisSelectSx }}
              >
                {PS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 44 }}>
                <Typography color="text.secondary">Delivery Status:</Typography>
                <Chip
                  size="small"
                  color={globalStatus === "Completed" ? "success" : "warning"}
                  label={globalStatus}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Add Product */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Row 1: Product | Qty */}
            <Grid item xs={12} sm={6} sx={{ minWidth: 0 }}>
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
                    if (!v) return renderValueEllipsis("Select product…");
                    const sel = productsForSupplier.find(p => String(p.product_id) === String(v));
                    const name = sel?.product_name || "";
                    const sku = sel?.sku ? ` (${sel.sku})` : "";
                    return renderValueEllipsis(`${name}${sku}`);
                  }
                }}
                placeholder="Select product…"
                InputLabelProps={{ shrink: true }}
                sx={{ ...fieldSx, ...ellipsisSelectSx }}
              >
                <MenuItem disabled value="">
                  <em>Select product…</em>
                </MenuItem>
                {productsForSupplier.map(p => (
                  <MenuItem key={p.product_id} value={String(p.product_id)}>
                    <Tooltip title={`${p.product_name}${p.sku ? ` (${p.sku})` : ``}`}>
                      <ListItemText
                        primaryTypographyProps={{ noWrap: true }}
                        secondaryTypographyProps={{ noWrap: true }}
                        primary={p.product_name}
                        secondary={p.sku ? `SKU: ${p.sku}` : undefined}
                      />
                    </Tooltip>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>

            {/* Row 2: Unit | Total */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Cost"
                size="small"
                type="number"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled
                sx={fieldSx}
                InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Total Cost" size="small" value={peso(addTotal)} disabled sx={fieldSx} />
            </Grid>

            {/* Row 3: Received | Deliverystatus */}
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Delivery Status" size="small" value={addStatus} disabled sx={fieldSx}>
                {DS.map(d => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
              </TextField>
            </Grid>

            {/* Row 4: Remaining | Add */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Remaining to Receive" size="small" value={addRemain} disabled sx={fieldSx} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 44 }}>
                <Chip size="small" color={addStatus === "Completed" ? "success" : "warning"} label={addStatus} />
                <Box sx={{ flex: 1 }} />
                <Button
                  startIcon={<MdAdd />}
                  variant="contained"
                  onClick={onAddLine}
                  disabled={!pId || !Number(qty)}
                  sx={{ minWidth: 140 }}
                >
                  Add Product
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lines table */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ tableLayout: "fixed", width: "100%", minWidth: 720 }}>
              <colgroup>
                <col style={{ width: 100 }} />   {/* Product */}
                <col style={{ width: "40%" }} />     {/* Qty Ordered */}
                <col style={{ width: 110 }} />     {/* Unit ₱ */}
                <col style={{ width: 110 }} />     {/* Qty Received */}
                <col style={{ width: 100 }} />     {/* Remaining */}
                <col style={{ width: 120 }} />     {/* Status */}
                <col style={{ width: 140 }} />     {/* Total ₱ */}
                <col style={{ width: 64 }} />      {/* Actions */}
              </colgroup>

              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Qty Ordered</TableCell>
                  <TableCell align="center">Unit ₱</TableCell>
                  <TableCell align="center">Qty Received</TableCell>
                  <TableCell align="center">Remaining</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Total ₱</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {lines.map(l => {
                  const q = Number(l.quantity || 0);
                  const r = Number(l.qty_received || 0);
                  const u = Number(l.unit_cost || 0);
                  const remain = Math.max(0, q - r);
                  const status = q > 0 && r === q ? "Completed" : "Pending";
                  const lineTotal = q * u;

                  return (
                    <TableRow key={l.temp_id}>
                      <TableCell align="center" sx={{ minWidth: 0 }}>
                        <Typography noWrap title={l.product_name}>{l.product_name}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{q}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{peso(u)}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{r}</Typography>
                      </TableCell>

                      <TableCell align="center">{remain}</TableCell>

                      <TableCell align="center">
                        <Chip size="small" color={status === "Completed" ? "success" : "warning"} label={status} />
                      </TableCell>

                      <TableCell align="center">{peso(lineTotal)}</TableCell>

                      <TableCell align="center">
                        <IconButton color="error" onClick={() => onRemoveLine(l.temp_id)}><MdDelete /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {lines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ p: 3 }}>
                        <Typography color="text.secondary">No items yet. Add a product above.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {lines.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={5} />
                    <TableCell align="center"><b>Grand Total</b></TableCell>
                    <TableCell align="center"><b>{peso(grandTotal)}</b></TableCell>
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
