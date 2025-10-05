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

  return (
    <Stack spacing={3} sx={{ maxWidth: "100%" }}>
      {/* Header */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
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
                onChange={(e)=>setPurchaseDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Supplier"
                size="small"
                value={supplierId}
                onChange={(e)=>{ setSupplierId(e.target.value); }}
                SelectProps={{
                  ...selectCommon,
                  renderValue: (v) => {
                    if (!v) return "Select supplier…";
                    const sel = suppliers.find(s => String(s.supplier_id) === String(v));
                    return sel?.supplier_name || "Select supplier…";
                  }
                }}
                placeholder="Select supplier…"
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              >
                <MenuItem disabled value="">
                  <em>Select supplier…</em>
                </MenuItem>
                {suppliers.map(s=>(
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Payment Status"
                size="small"
                value={paymentStatus}
                onChange={(e)=>setPaymentStatus(e.target.value)}
                SelectProps={{ ...selectCommon, renderValue: (v)=> PS.find(p=>p.value===v)?.label || "Select payment status…" }}
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
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

      {/* Add line */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Row 1: Product | Qty */}
            <Grid item xs={12} sm={6}>
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
                    if (!v) return "Select product…";
                    const sel = productsForSupplier.find(p => String(p.product_id) === String(v));
                    const name = sel?.product_name || "";
                    const sku  = sel?.sku ? ` (${sel.sku})` : "";
                    return `${name}${sku}`;
                  }
                }}
                placeholder="Select product…"
                InputLabelProps={{ shrink: true }}
                sx={fieldSx}
              >
                <MenuItem disabled value="">
                  <em>Select product…</em>
                </MenuItem>
                {productsForSupplier.map(p=>(
                  <MenuItem key={p.product_id} value={String(p.product_id)}>
                    <Tooltip title={`${p.product_name}${p.sku?` (${p.sku})`:``}`}>
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
                onChange={(e)=>setQty(e.target.value)}
                inputProps={{ min:0 }}
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
                onChange={(e)=>setUnit(e.target.value)}
                disabled={!pId}
                sx={fieldSx}
                InputProps={{ startAdornment:<InputAdornment position="start">₱</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Total Cost" size="small" value={peso(addTotal)} disabled sx={fieldSx}/>
            </Grid>

            {/* Row 3: Received | Deliverystatus */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Qty. Received"
                size="small"
                type="number"
                value={recv}
                onChange={(e)=>setRecv(e.target.value)}
                inputProps={{ min:0, max:Number(qty)||undefined }}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Delivery Status" size="small" value={addStatus} disabled sx={fieldSx}>
                {DS.map(d=> <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
              </TextField>
            </Grid>

            {/* Row 4: Remaining | Add */}
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Remaining to Receive" size="small" value={addRemain} disabled sx={fieldSx}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minHeight: 44 }}>
                <Chip size="small" color={addStatus === "Completed" ? "success" : "warning"} label={addStatus} />
                <Box sx={{ flex: 1 }} />
                <Button
                  startIcon={<MdAdd/>}
                  variant="contained"
                  onClick={onAddLine}
                  disabled={!pId || !Number(qty)}
                  sx={{ minWidth: 140 }}
                >
                  Add line
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lines table  */}
      <Card sx={{ borderRadius:2, boxShadow:3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Qty Ordered</TableCell>
                  <TableCell align="right">Unit ₱</TableCell>
                  <TableCell align="right">Qty Received</TableCell>
                  <TableCell align="right">Remaining</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Total ₱</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map(l=>{
                  const q = Number(l.quantity||0);
                  const r = Number(l.qty_received||0);
                  const u = Number(l.unit_cost||0);
                  const remain = Math.max(0, q - r);
                  const status = q>0 && r===q ? "Completed" : "Pending";
                  const lineTotal = q*u;

                  return (
                    <TableRow key={l.temp_id}>
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography noWrap title={l.product_name}>{l.product_name}</Typography>
                      </TableCell>

                      <TableCell align="right">
                        <TextField size="small" type="number" value={l.quantity}
                          onChange={e=>onUpdateCell(l.temp_id,"quantity",Number(e.target.value||0))}
                          sx={{ width: 100 }} inputProps={{ min:0 }} />
                      </TableCell>

                      <TableCell align="right">
                        <TextField size="small" type="number" value={l.unit_cost}
                          onChange={e=>onUpdateCell(l.temp_id,"unit_cost",Number(e.target.value||0))}
                          sx={{ width: 110 }}
                          InputProps={{ startAdornment:<InputAdornment position="start">₱</InputAdornment> }} />
                      </TableCell>

                      <TableCell align="right">
                        <TextField size="small" type="number" value={l.qty_received}
                          onChange={e=>onUpdateCell(l.temp_id,"qty_received",Number(e.target.value||0))}
                          sx={{ width: 110 }} inputProps={{ min:0, max:q||undefined }} />
                      </TableCell>

                      <TableCell align="right">{remain}</TableCell>

                      <TableCell align="center">
                        <Chip size="small" color={status==="Completed"?"success":"warning"} label={status} />
                      </TableCell>

                      <TableCell align="right">{peso(lineTotal)}</TableCell>

                      <TableCell align="right">
                        <IconButton color="error" onClick={()=>onRemoveLine(l.temp_id)}><MdDelete/></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {lines.length===0 && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ p: 3 }}>
                        <Typography color="text.secondary">No items yet. Add a product above.</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {lines.length>0 && (
                  <TableRow>
                    <TableCell colSpan={5} />
                    <TableCell align="right"><b>Grand Total</b></TableCell>
                    <TableCell align="right"><b>{peso(grandTotal)}</b></TableCell>
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
