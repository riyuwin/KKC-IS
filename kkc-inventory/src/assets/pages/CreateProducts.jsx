import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Grid, Stack, Button } from "@mui/material";
import { PortSuppliers, PortProducts } from "../api_ports/api";

import CreateProductComponent from "../components/CreateProductComponent";
import ProductCreationSummary from "../components/ProductCreationSummary";

function generateClientSku() {
  let s = "";
  for (let i = 0; i < 10; i++) s += Math.floor(Math.random() * 10);
  return s;
}

const peso = (n) =>
  (Number(n || 0)).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

export default function CreateProduct() {
  const [role, setRole] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const [suppliers, setSuppliers] = useState([]);

  const [lines, setLines] = useState([]);

  // add-line fields
  const [pName, setPName] = useState("");
  const [sku, setSku] = useState(generateClientSku());
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("");
  const [stock, setStock] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [supplierId, setSupplierId] = useState("");

  // session & warehouses (for admin)
  useEffect(() => {
    (async () => {
      try {
        const sres = await fetch("/session", { credentials: "include" });
        const sdata = await sres.json();
        const r = String(sdata?.user?.role || "").toLowerCase();
        setRole(r);

        if (r === "admin") {
          const wres = await fetch("/warehouse", { credentials: "include" });
          const wdata = await wres.json();
          const list = Array.isArray(wdata) ? wdata : [];
          setWarehouses(
            list.map((w) => ({
              warehouse_id: w.warehouse_id,
              warehouse_name:
                w.warehouse_name || `Warehouse #${w.warehouse_id}`,
            }))
          );
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // suppliers
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(PortSuppliers);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.results || [];
        setSuppliers(arr);
      } catch {
        // ignore
      }
    })();
  }, []);

  // summary calculations
  const itemsCount = lines.length;
  const totalInitialStock = useMemo(
    () => lines.reduce((sum, l) => sum + Number(l.stock || 0), 0),
    [lines]
  );
  const totalInventoryCost = useMemo(
    () =>
      lines.reduce(
        (sum, l) =>
          sum + Number(l.stock || 0) * Number(l.cost_price || 0),
        0
      ),
    [lines]
  );
  const totalPotentialRevenue = useMemo(
    () =>
      lines.reduce(
        (sum, l) =>
          sum + Number(l.stock || 0) * Number(l.selling_price || 0),
        0
      ),
    [lines]
  );

  function addLine() {
    if (!pName.trim()) {
      alert("Product Name is required.");
      return;
    }
    if (!supplierId) {
      alert("Please select a supplier.");
      return;
    }
    if (!/^\d{10}$/.test(String(sku))) {
      alert("SKU must be a 10-digit number.");
      return;
    }

    const supplier = suppliers.find(
      (s) => String(s.supplier_id) === String(supplierId)
    );
    const supplier_name = supplier?.supplier_name || supplier?.name || "";

    setLines((ls) => [
      ...ls,
      {
        temp_id: crypto.randomUUID(),
        product_name: pName.trim(),
        sku: String(sku),
        description: description.trim(),
        unit: unit.trim(),
        stock: Number(stock || 0),
        cost_price: costPrice === "" ? "" : Number(costPrice),
        selling_price: sellingPrice === "" ? "" : Number(sellingPrice),
        supplier_id: supplierId,
        supplier_name,
      },
    ]);

    // reset add-line fields
    setPName("");
    setSku(generateClientSku());
    setDescription("");
    setUnit("");
    setStock("");
    setCostPrice("");
    setSellingPrice("");
    setSupplierId("");
  }

  function removeLine(id) {
    setLines((ls) => ls.filter((l) => l.temp_id !== id));
  }

  async function save() {
    if (!lines.length) {
      alert("No products to save.");
      return;
    }

    const isAdmin = role === "admin";
    const warehouseToUse =
      isAdmin && selectedWarehouse ? Number(selectedWarehouse) : null;

    for (const l of lines) {
      const payload = {
        product_name: l.product_name,
        sku: l.sku,
        description: l.description,
        unit: l.unit,
        stock: Number(l.stock || 0),
        cost_price: l.cost_price === "" ? null : Number(l.cost_price),
        selling_price:
          l.selling_price === "" ? null : Number(l.selling_price),
        supplier_id: l.supplier_id,
        ...(warehouseToUse ? { warehouse_id: warehouseToUse } : {}),
      };

      const r = await fetch(PortProducts, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) {
        alert(j?.error || "Failed to save one of the products.");
        return;
      }
    }

    window.history.back();
  }

  const fieldSx = {
    "& .MuiInputBase-root": { minHeight: 44 },
    "& .MuiFormHelperText-root": { minHeight: 20 },
  };

  const pageSx = { p: { xs: 2, sm: 3 }, bgcolor: "#f9fafb", minHeight: "100vh" };
  const contentSx = { maxWidth: 1300, mx: "auto" };

  return (
    <Box sx={pageSx}>
      <Box sx={contentSx}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          New Products
        </Typography>

        <Grid
          container
          spacing={3}
          alignItems="flex-start"
          sx={{
            flexWrap: "nowrap",
            overflowX: "auto",
            pb: 1,
          }}
        >
          {/* LEFT column (editor) */}
          <Grid item xs={8} md={8} lg={9}>
            <CreateProductComponent
              role={role}
              warehouses={warehouses}
              selectedWarehouse={selectedWarehouse}
              setSelectedWarehouse={setSelectedWarehouse}
              suppliers={suppliers}
              // add-line fields
              pName={pName}
              setPName={setPName}
              sku={sku}
              setSku={setSku}
              description={description}
              setDescription={setDescription}
              unit={unit}
              setUnit={setUnit}
              stock={stock}
              setStock={setStock}
              costPrice={costPrice}
              setCostPrice={setCostPrice}
              sellingPrice={sellingPrice}
              setSellingPrice={setSellingPrice}
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              // lines
              lines={lines}
              onAddLine={addLine}
              onRemoveLine={removeLine}
              fieldSx={fieldSx}
              peso={peso}
            />

            {/* Actions */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={save}
                disabled={
                  !lines.length || (role === "admin" && !selectedWarehouse)
                }
              >
                Save Products
              </Button>
            </Stack>
          </Grid>

          {/* RIGHT column (summary) */}
          <Grid
            item
            xs={4}
            md={4}
            lg={3}
            sx={{
              position: "sticky",
              top: 24,
              alignSelf: "flex-start",
              height: "fit-content",
              minWidth: 300,
            }}
          >
            <ProductCreationSummary
              itemsCount={itemsCount}
              totalInitialStock={totalInitialStock}
              totalInventoryCost={totalInventoryCost}
              totalPotentialRevenue={totalPotentialRevenue}
              lines={lines}
              peso={peso}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
