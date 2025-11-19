import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Stack, Grid, Button } from "@mui/material";
import { PortSuppliers, PortProducts, PortDashboard } from "../api_ports/api";

import CreatePurchaseComponent from "../components/CreatePurchaseComponent";
import PurchaseOrderSummary from "../components/PurchaseOrderSummary";

const API = PortDashboard;
const peso = (n) =>
  (Number(n || 0)).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

const DS = [
  { value: "Pending", label: "Pending" },
  { value: "Completed", label: "Completed" },
];

const PS = [
  { value: "Unpaid", label: "Unpaid" },
  { value: "Partially Paid", label: "Partially Paid" },
  { value: "Fully Paid", label: "Fully Paid" },
];

const VAT_OPTIONS = [
  { value: "non-vat", label: "Non-VAT" },
  { value: "inc-vat", label: "VAT Inclusive (12%)" },
  { value: "ext-vat", label: "VAT Exclusive (12%)" },
];

function todayYYYYMMDD() {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function CreatePurchase() {
  const [purchaseDate, setPurchaseDate] = useState(() => todayYYYYMMDD());

  const [supplierId, setSupplierId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [lines, setLines] = useState([]);

  // add-line
  const [pId, setPId] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [recv, setRecv] = useState("");

  const [editingId, setEditingId] = useState(null);

  // VAT mode: non-vat | inc-vat | ext-vat
  const [vatMode, setVatMode] = useState("non-vat");

  const addQty = Number(qty || 0);
  const addRecv = Number(recv || 0);
  const addUnit = Number(unit || 0);
  const addTotal = addQty * addUnit;
  const addRemain = Math.max(0, addQty - addRecv);
  const addStatus = addQty > 0 && addRecv === addQty ? "Completed" : "Pending";

  useEffect(() => {
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch(PortSuppliers, { credentials: "include" }),
          fetch(PortProducts, { credentials: "include" }),
        ]);

        const [sJson, pJson] = await Promise.all([sRes.json(), pRes.json()]);

        setSuppliers(Array.isArray(sJson) ? sJson : []);
        setProducts(Array.isArray(pJson) ? pJson : []);
      } catch (e) {
        console.error("Failed to load suppliers/products:", e);
        setSuppliers([]);
        setProducts([]);
      }
    })();
  }, []);

  const productsForSupplier = useMemo(
    () =>
      supplierId
        ? products.filter(
            (p) => String(p.supplier_id) === String(supplierId)
          )
        : [],
    [products, supplierId]
  );

  const grandTotal = useMemo(
    () =>
      lines.reduce(
        (sum, l) =>
          sum + Number(l.quantity || 0) * Number(l.unit_cost || 0),
        0
      ),
    [lines]
  );

  const allCompleted = useMemo(
    () =>
      lines.length > 0 &&
      lines.every(
        (l) => Number(l.qty_received || 0) >= Number(l.quantity || 0)
      ),
    [lines]
  );
  const globalStatus = allCompleted ? "Completed" : "Pending";

  const totalQtyOrdered = useMemo(
    () => lines.reduce((s, l) => s + Number(l.quantity || 0), 0),
    [lines]
  );
  const totalQtyReceived = useMemo(
    () =>
      lines.reduce((s, l) => {
        const q = Number(l.quantity || 0);
        const r = Math.min(Number(l.qty_received || 0), q);
        return s + r;
      }, 0),
    [lines]
  );
  const totalQtyOutstanding = Math.max(0, totalQtyOrdered - totalQtyReceived);

  const outstandingValue = useMemo(
    () =>
      lines.reduce((s, l) => {
        const q = Number(l.quantity || 0);
        const r = Math.min(Number(l.qty_received || 0), q);
        const u = Number(l.unit_cost || 0);
        return s + Math.max(0, q - r) * u;
      }, 0),
    [lines]
  );

  // Map VAT mode to numeric rate (for display / info if needed)
  const numericVatRate = useMemo(() => {
    if (vatMode === "inc-vat") return 0.12;
    if (vatMode === "ext-vat") return 0.12;
    return 0;
  }, [vatMode]);

  const { estVat, estTotalWithVat } = useMemo(() => {
    if (!grandTotal) {
      return { estVat: 0, estTotalWithVat: 0 };
    }

    if (vatMode === "inc-vat") {
      const rate = numericVatRate || 0.12;
      const vatPart = grandTotal - grandTotal / (1 + rate);
      return { estVat: vatPart, estTotalWithVat: grandTotal };
    }

    if (vatMode === "ext-vat") {
      const rate = numericVatRate || 0.12;
      const vatPart = grandTotal * rate;
      return { estVat: vatPart, estTotalWithVat: grandTotal + vatPart };
    }

    // non-vat
    return { estVat: 0, estTotalWithVat: grandTotal };
  }, [grandTotal, vatMode, numericVatRate]);

  function resetAddForm() {
    setPId("");
    setQty("");
    setUnit("");
    setRecv("");
  }

  function onSelectProduct(e) {
    const val = e.target.value;
    setPId(val);

    // Try to find product in filtered list first, fallback to full list
    const prod =
      productsForSupplier.find(
        (p) => String(p.product_id) === String(val)
      ) ||
      products.find((p) => String(p.product_id) === String(val));

    if (prod?.supplier_id) {
      setSupplierId(String(prod.supplier_id));
    }

    setUnit(prod?.cost_price ?? "");
  }

  function addOrUpdateLine() {
    if (!pId || !addQty) return;

    const prod =
      products.find((p) => String(p.product_id) === String(pId)) ||
      productsForSupplier.find(
        (p) => String(p.product_id) === String(pId)
      );

    const supplier_id = prod
      ? Number(prod.supplier_id)
      : supplierId
      ? Number(supplierId)
      : null;

    if (!supplier_id) {
      alert("This product has no supplier assigned.");
      return;
    }

    const baseLine = {
      supplier_id,
      product_id: Number(pId),
      product_name: prod?.product_name || `#${pId}`,
      quantity: addQty,
      unit_cost: unit === "" ? Number(prod?.cost_price || 0) : addUnit,
      qty_received: addRecv,
    };

    if (editingId) {
      // update existing line
      setLines((ls) =>
        ls.map((l) => (l.temp_id === editingId ? { ...l, ...baseLine } : l))
      );
    } else {
      // add new line
      setLines((ls) => [
        ...ls,
        {
          temp_id: crypto.randomUUID(),
          ...baseLine,
        },
      ]);
    }

    setEditingId(null);
    resetAddForm();
  }

  function updateCell(id, key, val) {
    setLines((ls) =>
      ls.map((l) => (l.temp_id === id ? { ...l, [key]: val } : l))
    );
  }

  function removeLine(id) {
    setLines((ls) => ls.filter((l) => l.temp_id !== id));
    setEditingId((curr) => {
      if (curr === id) {
        resetAddForm();
        return null;
      }
      return curr;
    });
  }

  function startEditLine(line) {
    // Ensure product dropdown shows the correct supplier's products
    if (line.supplier_id) {
      setSupplierId(String(line.supplier_id));
    }

    setEditingId(line.temp_id);
    setPId(String(line.product_id));
    setQty(
      line.quantity === "" ||
      line.quantity === null ||
      line.quantity === undefined
        ? ""
        : String(line.quantity)
    );
    setRecv(
      line.qty_received === "" ||
      line.qty_received === null ||
      line.qty_received === undefined
        ? ""
        : String(line.qty_received)
    );
    setUnit(
      line.unit_cost === "" || line.unit_cost === null
        ? ""
        : String(line.unit_cost)
    );
  }

  async function save() {
    if (!purchaseDate || lines.length === 0) return;

    const payload = {
      purchase_date: purchaseDate,
      payment_status: paymentStatus,
      // supplier_id PER ITEM
      items: lines.map((l) => ({
        product_id: Number(l.product_id),
        supplier_id: Number(l.supplier_id),
        quantity: Number(l.quantity || 0),
        unit_cost: Number(l.unit_cost || 0),
        qty_received: Number(l.qty_received || 0),
      })),
    };

    console.log("SAVE BULK PAYLOAD:", payload);

    try {
      const r = await fetch(`${API}/purchases/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) {
        return alert(j?.error || "Failed to save purchase");
      }
      window.history.back();
    } catch (e) {
      console.error("Failed to save purchase:", e);
      alert("Failed to save purchase");
    }
  }

  const fieldSx = {
    "& .MuiInputBase-root": { minHeight: 44 },
    "& .MuiFormHelperText-root": { minHeight: 20 },
  };

  const pageSx = {
    p: { xs: 2, sm: 3 },
    bgcolor: "#f9fafb",
    minHeight: "100vh",
  };
  const contentSx = { maxWidth: 1300, mx: "auto" };

  // For the summary card: if multiple suppliers are involved, show "Multiple suppliers"
  const supplierName = useMemo(() => {
    const ids = Array.from(
      new Set(
        lines
          .map((l) => l.supplier_id)
          .filter((v) => v !== null && v !== undefined)
          .map(String)
      )
    );
    if (ids.length === 0) return "";
    if (ids.length === 1) {
      const sid = ids[0];
      return (
        suppliers.find(
          (s) => String(s.supplier_id) === String(sid)
        )?.supplier_name || ""
      );
    }
    return "Multiple suppliers";
  }, [lines, suppliers]);

  return (
    <Box sx={pageSx}>
      <Box sx={contentSx}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          New Purchase
        </Typography>

        {/* two-column layout at all widths */}
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
            <CreatePurchaseComponent
              // header
              purchaseDate={purchaseDate}
              setPurchaseDate={setPurchaseDate}
              supplierId={supplierId}
              setSupplierId={(v) => {
                setSupplierId(v);
                setEditingId(null);
                resetAddForm();
              }}
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
              suppliers={suppliers}
              productsForSupplier={productsForSupplier}
              globalStatus={globalStatus}
              PS={PS}
              DS={DS}
              // VAT
              vatMode={vatMode}
              setVatMode={setVatMode}
              vatOptions={VAT_OPTIONS}
              // add-line
              pId={pId}
              qty={qty}
              unit={unit}
              recv={recv}
              onSelectProduct={onSelectProduct}
              setQty={setQty}
              setUnit={setUnit}
              setRecv={setRecv}
              addTotal={addTotal}
              addRemain={addRemain}
              addStatus={addStatus}
              onAddLine={addOrUpdateLine}
              // editing
              editingId={editingId}
              onEditLine={startEditLine}
              // table
              lines={lines}
              onUpdateCell={updateCell}
              onRemoveLine={removeLine}
              grandTotal={grandTotal}
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
                disabled={!purchaseDate || !lines.length}
              >
                Save Purchase
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
            <PurchaseOrderSummary
              supplierName={supplierName}
              purchaseDate={purchaseDate}
              paymentStatus={paymentStatus}
              itemsCount={lines.length}
              subtotal={grandTotal}
              vat={estVat}
              total={estTotalWithVat}
              globalStatus={globalStatus}
              totalQtyOrdered={totalQtyOrdered}
              totalQtyReceived={totalQtyReceived}
              totalQtyOutstanding={totalQtyOutstanding}
              outstandingValue={outstandingValue}
              lines={lines}
              peso={peso}
              vatRate={numericVatRate}
              vatMode={vatMode}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
