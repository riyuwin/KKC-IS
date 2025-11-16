import React from "react";
import { Card, CardContent, Grid, Stack, TextField, MenuItem, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Typography, Button, Box, Tooltip, Chip, InputAdornment } from "@mui/material";
import { MdAdd, MdDelete } from "react-icons/md";

export default function CreateProductComponent({
  role,
  warehouses,
  selectedWarehouse,
  setSelectedWarehouse,
  suppliers,

  // add-line fields
  pName,
  setPName,
  sku,
  setSku,
  description,
  setDescription,
  unit,
  setUnit,
  stock,
  setStock,
  costPrice,
  setCostPrice,
  sellingPrice,
  setSellingPrice,
  supplierId,
  setSupplierId,

  // lines
  lines,
  onAddLine,
  onRemoveLine,

  fieldSx,
  peso,
}) {
  const isAdmin = String(role).toLowerCase() === "admin";

  const selectCommon = {
    displayEmpty: true,
    MenuProps: { PaperProps: { style: { maxHeight: 48 * 6 } } },
  };

  const ellipsisTextSx = {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: "100%", minWidth: 0 }}>
      {isAdmin && (
        <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Warehouse"
                  size="small"
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  SelectProps={selectCommon}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                  helperText="All products you add will be created under this warehouse"
                >
                  <MenuItem disabled value="">
                    <em>Select warehouse…</em>
                  </MenuItem>
                  {warehouses.map((w) => (
                    <MenuItem
                      key={w.warehouse_id}
                      value={String(w.warehouse_id)}
                    >
                      {w.warehouse_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: { xs: 1, sm: 2 } }}
                >
                  Use this page to add multiple products in one go.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Add Product */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            {/* Row 1: Product Name | SKU */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Product Name"
                size="small"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="SKU / Code (10 digits)"
                size="small"
                disabled
                value={sku}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setSku(v);
                }}
                sx={fieldSx}
                helperText="Auto-generated. You can edit if needed."
              />
            </Grid>

            {/* Row 2: Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                minRows={2}
                sx={fieldSx}
              />
            </Grid>

            {/* Row 3: Unit | Stock */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit (e.g., pcs, box)"
                size="small"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                sx={fieldSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Initial Stock"
                size="small"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                inputProps={{ min: 0 }}
                sx={fieldSx}
              />
            </Grid>

            {/* Row 4: Cost | Selling Price */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Cost Price (₱)"
                size="small"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₱</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Selling Price (₱)"
                size="small"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                inputProps={{ min: 0, step: "0.01" }}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₱</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Row 5: Supplier | Add Button */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Supplier"
                size="small"
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                sx={fieldSx}
                SelectProps={selectCommon}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem disabled value="">
                  <em>Select supplier…</em>
                </MenuItem>
                {suppliers.map((s) => (
                  <MenuItem key={s.supplier_id} value={s.supplier_id}>
                    {s.supplier_name || s.name || "Supplier"}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ minHeight: 44 }}
              >
                <Chip
                  size="small"
                  color={
                    Number(stock || 0) <= 0
                      ? "error"
                      : Number(stock || 0) <= 5
                      ? "warning"
                      : "success"
                  }
                  label={
                    Number(stock || 0) <= 0
                      ? "Out of Stock"
                      : Number(stock || 0) <= 5
                      ? "Low Stock"
                      : "In Stock"
                  }
                />
                <Box sx={{ flex: 1 }} />
                <Button
                  startIcon={<MdAdd />}
                  variant="contained"
                  onClick={onAddLine}
                  disabled={!pName.trim() || !supplierId}
                  sx={{ minWidth: 160 }}
                >
                  Add Product
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lines table – fixed layout, all columns always visible */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, minWidth: 0 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ width: "100%", overflowX: "hidden" }}>
            <Table
              size="small"
              sx={{
                tableLayout: "fixed",
                width: "100%",
                "& th, & td": { px: 1 }, // tighter padding so everything fits
              }}
            >
              <colgroup>
                <col style={{ width: "15%" }} /> {/* Product */}
                <col style={{ width: "11%" }} /> {/* SKU */}
                <col style={{ width: "19%" }} /> {/* Description */}
                <col style={{ width: "8%" }} />  {/* Unit */}
                <col style={{ width: "8%" }} />  {/* Stock */}
                <col style={{ width: "11%" }} /> {/* Cost */}
                <col style={{ width: "11%" }} /> {/* Selling */}
                <col style={{ width: "10%" }} /> {/* Supplier */}
                <col style={{ width: "7%" }} />  {/* Actions */}
              </colgroup>

              <TableHead>
                <TableRow>
                  <TableCell align="center">Product</TableCell>
                  <TableCell align="center">SKU</TableCell>
                  <TableCell align="center">Description</TableCell>
                  <TableCell align="center">Unit</TableCell>
                  <TableCell align="center">Stock</TableCell>
                  <TableCell align="center">Cost ₱</TableCell>
                  <TableCell align="center">Selling ₱</TableCell>
                  <TableCell align="center">Supplier</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.temp_id}>
                    <TableCell align="center">
                      <Typography
                        noWrap
                        title={l.product_name}
                        sx={ellipsisTextSx}
                      >
                        {l.product_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography noWrap title={l.sku} sx={ellipsisTextSx}>
                        {l.sku}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        noWrap
                        title={l.description}
                        sx={ellipsisTextSx}
                      >
                        {l.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography noWrap title={l.unit} sx={ellipsisTextSx}>
                        {l.unit}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        noWrap
                        title={String(l.stock || 0)}
                        sx={ellipsisTextSx}
                      >
                        {Number(l.stock || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        noWrap
                        title={
                          l.cost_price === "" ? "—" : peso(l.cost_price)
                        }
                        sx={ellipsisTextSx}
                      >
                        {l.cost_price === "" ? "—" : peso(l.cost_price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        noWrap
                        title={
                          l.selling_price === ""
                            ? "—"
                            : peso(l.selling_price)
                        }
                        sx={ellipsisTextSx}
                      >
                        {l.selling_price === ""
                          ? "—"
                          : peso(l.selling_price)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography
                        noWrap
                        title={l.supplier_name}
                        sx={ellipsisTextSx}
                      >
                        {l.supplier_name}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove">
                        <IconButton
                          color="error"
                          onClick={() => onRemoveLine(l.temp_id)}
                          size="small"
                        >
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {lines.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Box sx={{ p: 3 }}>
                        <Typography color="text.secondary">
                          No products yet. Add a product above.
                        </Typography>
                      </Box>
                    </TableCell>
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
