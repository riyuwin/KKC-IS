import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Stack, Grid, Button } from "@mui/material";
import { PortSuppliers, PortProducts, PortDashboard } from "../api_ports/api";
import Swal from "sweetalert2";
import CreateSalesComponent from "../components/CreateSalesComponent";
import SalesOrderSummary from "../components/SalesOrderSummary";
import { FetchCurrentUser } from "../logics/auth/FetchCurentUser";
import { useLocation } from "react-router-dom";

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

export default function CreateSales() {

  const location = useLocation();
  const navState = location.state || {};

  const [salesMode, setSalesMode] = useState();
  const [salesDate, setSalesDate] = useState(todayYYYYMMDD());
  const [supplierId, setSupplierId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([]);

  const [pId, setPId] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [recv, setRecv] = useState("");
  const [selectedCustomerName, setCustomerName] = useState("");
  const [selectedWarehouseId, setWarehouseId] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [vatMode, setVatMode] = useState("non-vat");

  const accountDetails = FetchCurrentUser();

  const addQty = Number(qty || 0);
  const addRecv = Number(recv || 0);
  const addUnit = Number(unit || 0);
  const addTotal = addQty * addUnit;
  const addRemain = Math.max(0, addQty - addRecv);
  const addStatus = addQty > 0 && addRecv === addQty ? "Completed" : "Pending";

  // If navigated from /sales with data, prefill the form
  useEffect(() => {
    if (navState.mode && navState.saleData) {
      const sale_mode = navState.saleData.mode;
      const sale = navState.saleData.sale;
      const items = navState.saleData.sales_item ? [navState.saleData.sales_item] : [];
      const customerName = sale.customer_name || "";
      const warehouseId = sale.warehouse_id || "";
      const payment = sale.sale_payment_status || "Unpaid";

      setSalesMode(sale_mode);
      setSalesDate(sale.sale_date || todayYYYYMMDD());
      setPaymentStatus(payment);
      setCustomerName(customerName);
      setWarehouseId(warehouseId);
      setLines(items);
      if (navState.mode === "View") {
        // Disable editing
        setEditingId(null);
      }
    }
  }, [navState]);

  // Fetch suppliers & products
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
        ? products.filter((p) => String(p.supplier_id) === String(supplierId))
        : [],
    [products, supplierId]
  );

  const grandTotal = useMemo(
    () =>
      lines.reduce((sum, l) => sum + Number(l.quantity || 0) * Number(l.unit_cost || 0), 0),
    [lines]
  );

  const allCompleted = useMemo(
    () =>
      lines.length > 0 &&
      lines.every((l) => Number(l.qty_received || 0) >= Number(l.quantity || 0)),
    [lines]
  );
  const globalStatus = allCompleted ? "Completed" : "Pending";

  const totalQtyOrdered = useMemo(() => lines.reduce((s, l) => s + Number(l.quantity || 0), 0), [lines]);
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

  const numericVatRate = useMemo(() => (vatMode === "non-vat" ? 0 : 0.12), [vatMode]);

  const { estVat, estTotalWithVat } = useMemo(() => {
    if (!grandTotal) return { estVat: 0, estTotalWithVat: 0 };
    if (vatMode === "inc-vat") {
      const vatPart = grandTotal - grandTotal / (1 + numericVatRate);
      return { estVat: vatPart, estTotalWithVat: grandTotal };
    }
    if (vatMode === "ext-vat") {
      const vatPart = grandTotal * numericVatRate;
      return { estVat: vatPart, estTotalWithVat: grandTotal + vatPart };
    }
    return { estVat: 0, estTotalWithVat: grandTotal };
  }, [grandTotal, vatMode, numericVatRate]);

  function resetAddForm() {
    setPId("");
    setQty("");
    setUnit("");
    setRecv("");
    setEditingId(null);
  }

  function onSelectProduct(e) {
    const val = e.target.value;
    setPId(val);
    const prod =
      productsForSupplier.find((p) => String(p.product_id) === String(val)) ||
      products.find((p) => String(p.product_id) === String(val));
    if (prod?.supplier_id) setSupplierId(String(prod.supplier_id));
    setUnit(prod?.cost_price ?? "");
  }

  function addOrUpdateLine() {
    if (!pId || !addQty) return;

    /* const prod = products.find((p) => String(p.product_id) === String(pId));
    const supplier_id = prod ? Number(prod.supplier_id) : Number(supplierId);
    */

    const prod = products.find((p) => String(p.product_id) === String(pId));
    const supplier_id = prod ? Number(prod.supplier_id) : Number(supplierId);

    const baseLine = {
      supplier_id,
      product_id: Number(pId),
      product_name: prod?.product_name || `#${pId}`,
      quantity: addQty,
      unit_cost: unit === "" ? Number(prod?.cost_price || 0) : addUnit,
      qty_received: addRecv,
    };

    if (editingId) {
      setLines((ls) => ls.map((l) => (l.temp_id === editingId ? { ...l, ...baseLine } : l)));
    } else {
      setLines((ls) => [...ls, { temp_id: crypto.randomUUID(), ...baseLine }]);
    }

    resetAddForm();
  }

  function startEditLine(line) {
    setEditingId(line.temp_id);
    setPId(String(line.product_id));
    setQty(String(line.quantity || ""));
    setUnit(String(line.unit_cost || ""));
    setRecv(String(line.qty_received || ""));
    setSupplierId(String(line.supplier_id));
  }

  const save = async () => {
    if (!salesDate || lines.length === 0) return;

    const payload = {
      sales_id: navState.salesId || null, // ✅ add this
      account_id: accountDetails?.account_id,
      sale_date: salesDate,
      sale_payment_status: paymentStatus,
      customer_name: selectedCustomerName,
      warehouse_id: selectedWarehouseId,
      delivery_status: globalStatus,
      total_sale: Number(grandTotal),

      items: lines.map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity || 0),
        qty_received: Number(l.qty_received || 0),

        supplier_id: Number(l.supplier_id),   // ✔ ADDED HERE

        unit_cost: Number(l.unit_cost || 0),
        total_delivery_quantity: Number(l.qty_received || 0),
        total_delivered: Number(l.qty_received || 0),

        sale_payment_status: paymentStatus,
        delivery_status:
          Number(l.qty_received || 0) >= Number(l.quantity || 0)
            ? "Completed"
            : "Pending",
      })),
    };

    console.log("🔥 PAYLOAD TO SEND:", payload); // ✔ DEBUG LOG
    console.log("🔥 ITEMS:", payload.items);     // ✔ DEBUG LOG

    try {
      const r = await fetch(`${API}/sales/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const j = await r.json();

      console.log("🔥 RESPONSE:", j); // ✔ DEBUG LOG

      if (!r.ok) return alert(j?.error || "Failed to save sales");

      Swal.fire({
        title: "Success!",
        text: "Sales saved successfully.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // reset fields (if not reloading)
        setCustomerName("");
        setWarehouseId("");
        setSupplierId("");
        setSalesDate(todayYYYYMMDD());
        setLines([]);
        resetAddForm();

        // or reload:
        // window.location.reload();
      });
    } catch (e) {
      console.error("Failed to save sales:", e);
      alert("Failed to save sales");
    }
  };


  useEffect(() => {
    if (navState.mode && navState.salesId) {
      fetch(`${API}/sales/${navState.salesId}`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          const sale = data.sale;
          const items = data.items || [];

          console.log("DATAA: ", data)

          setSalesMode(navState.mode);
          setSalesDate(sale.sale_date);
          setPaymentStatus(sale.sale_payment_status);
          setCustomerName(sale.customer_name);
          setWarehouseId(String(sale.warehouse_id));

          setLines(
            items.map(it => ({
              temp_id: crypto.randomUUID(),
              product_id: it.product_id,
              product_name: it.product_name,
              quantity: it.product_quantity,
              unit_cost: it.cost_price,
              qty_received: it.qty_received,
              supplier_id: it.supplier_id || "",   // ✔ INCLUDED
            }))
          );


          if (navState.mode === "View") {
            setEditingId(null);
          }
        })
        .catch(err => console.error("Load sale failed:", err));
    }
  }, [navState]);


  const fieldSx = { "& .MuiInputBase-root": { minHeight: 44 }, "& .MuiFormHelperText-root": { minHeight: 20 } };
  const pageSx = { p: { xs: 2, sm: 3 }, bgcolor: "#f9fafb", minHeight: "100vh" };
  const contentSx = { maxWidth: 1300, mx: "auto" };

  const supplierName = useMemo(() => {
    const ids = Array.from(new Set(lines.map((l) => String(l.supplier_id))));
    if (ids.length === 0) return "";
    if (ids.length === 1) {
      const sel = suppliers.find((s) => String(s.supplier_id) === ids[0]);
      return sel?.supplier_name || "";
    }
    return "Multiple suppliers";
  }, [lines, suppliers]);

  return (
    <Box sx={pageSx}>
      <Box sx={contentSx}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          New Sales
        </Typography>
        <Grid container spacing={3} alignItems="flex-start" sx={{ flexWrap: "nowrap", overflowX: "auto", pb: 1 }}>
          <Grid item xs={8} md={8} lg={9}>
            <CreateSalesComponent
              salesDate={salesDate}
              setSalesDate={setSalesDate}
              supplierId={supplierId}
              setSupplierId={setSupplierId}
              paymentStatus={paymentStatus}
              setPaymentStatus={setPaymentStatus}
              suppliers={suppliers}
              productsForSupplier={productsForSupplier}
              globalStatus={globalStatus}
              PS={PS}
              DS={DS}
              vatMode={vatMode}
              setVatMode={setVatMode}
              vatOptions={VAT_OPTIONS}
              selectedCustomerName={selectedCustomerName}
              selectedWarehouseId={selectedWarehouseId}
              pId={pId}
              qty={qty}
              unit={unit}
              recv={recv}
              onSelectProduct={onSelectProduct}
              setSelectedCustomerName={setCustomerName}
              setSelectedWarehouseId={setWarehouseId}
              setQty={setQty}
              setUnit={setUnit}
              setRecv={setRecv}
              addTotal={addTotal}
              addRemain={addRemain}
              addStatus={addStatus}
              onAddLine={addOrUpdateLine}
              editingId={editingId}
              onEditLine={startEditLine}
              lines={lines}
              grandTotal={grandTotal}
              onUpdateCell={(id, key, val) => setLines((ls) => ls.map((l) => (l.temp_id === id ? { ...l, [key]: val } : l)))}
              onRemoveLine={(id) => setLines((ls) => ls.filter((l) => l.temp_id !== id))}
              fieldSx={fieldSx}
              peso={peso}
            />
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={() => window.history.back()}>Cancel</Button>
              <Button variant="contained" onClick={save} disabled={!salesDate || !lines.length}>Save Sales</Button>
            </Stack>
          </Grid>
          <Grid item xs={4} md={4} lg={3} sx={{ position: "sticky", top: 24, alignSelf: "flex-start", height: "fit-content", minWidth: 300 }}>
            <SalesOrderSummary
              supplierName={supplierName}
              salesDate={salesDate}
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
