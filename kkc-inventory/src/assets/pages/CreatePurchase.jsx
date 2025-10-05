import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Stack, Grid, Button } from "@mui/material";
import { PortSuppliers, PortProducts, PortDashboard } from "../api_ports/api";

import CreatePurchaseComponent from "../components/CreatePurchaseComponent";
import PurchaseOrderSummary from "../components/PurchaseOrderSummary";

const API = PortDashboard;
const peso = (n)=> (Number(n||0)).toLocaleString("en-PH",{style:"currency",currency:"PHP"});

const DS = [{ value:"Pending",label:"Pending"},{ value:"Completed",label:"Completed"}];
const PS = [
  { value: "Unpaid",         label: "Unpaid" },
  { value: "Partially Paid", label: "Partially Paid" },
  { value: "Fully Paid",     label: "Fully Paid" },
];

function todayYYYYMMDD(){ const d=new Date(); const pad=v=>String(v).padStart(2,"0"); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }

export default function CreatePurchase() {
  const [purchaseDate, setPurchaseDate] = useState(()=>todayYYYYMMDD());
  const [supplierId, setSupplierId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts]   = useState([]);

  const [lines, setLines] = useState([]);

  // add-line controls
  const [pId, setPId] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [recv, setRecv] = useState("");

  const addQty   = Number(qty||0);
  const addRecv  = Number(recv||0);
  const addUnit  = Number(unit||0);
  const addTotal = addQty * addUnit;
  const addRemain = Math.max(0, addQty - addRecv);
  const addStatus = addQty>0 && addRecv===addQty ? "Completed" : "Pending";

  useEffect(()=>{ (async()=>{
    const [s,p]=await Promise.all([fetch(PortSuppliers), fetch(PortProducts)]);
    setSuppliers(await s.json()); setProducts(await p.json());
  })(); },[]);

  const productsForSupplier = useMemo(
    ()=> supplierId ? products.filter(p => String(p.supplier_id) === String(supplierId)) : [],
    [products, supplierId]
  );

  const grandTotal = useMemo(
    ()=> lines.reduce((sum,l)=> sum + Number(l.quantity||0)*Number(l.unit_cost||0), 0),
    [lines]
  );
  const allCompleted = useMemo(
    ()=> lines.length>0 && lines.every(l => Number(l.qty_received||0) >= Number(l.quantity||0)),
    [lines]
  );
  const globalStatus = allCompleted ? "Completed" : "Pending";

  const totalQtyOrdered = useMemo(()=> lines.reduce((s,l)=> s + Number(l.quantity||0), 0), [lines]);
  const totalQtyReceived = useMemo(()=> lines.reduce((s,l)=> s + Math.min(Number(l.qty_received||0), Number(l.quantity||0)), 0), [lines]);
  const totalQtyOutstanding = Math.max(0, totalQtyOrdered - totalQtyReceived);
  const outstandingValue = useMemo(()=> lines.reduce((s,l)=>{
    const q=Number(l.quantity||0), r=Math.min(Number(l.qty_received||0), q), u=Number(l.unit_cost||0);
    return s + Math.max(0, q-r) * u;
  },0), [lines]);

  const VAT_RATE = 0.12;
  const estVat = grandTotal * VAT_RATE;
  const estTotalWithVat = grandTotal + estVat;

  function onSelectProduct(e){
    const val=e.target.value;
    setPId(val);
    const prod = productsForSupplier.find(p => String(p.product_id) === String(val));
    setUnit(prod?.cost_price ?? "");
  }

  function addLine(){
    if (!pId || !addQty) return;
    const prod = productsForSupplier.find(p => String(p.product_id) === String(pId));
    setLines(ls=>[...ls, {
      temp_id: crypto.randomUUID(),
      product_id: Number(pId),
      product_name: prod?.product_name || `#${pId}`,
      quantity: addQty,
      unit_cost: unit==="" ? Number(prod?.cost_price||0) : addUnit,
      qty_received: addRecv,
    }]);
    setPId(""); setQty(""); setUnit(""); setRecv("");
  }

  function updateCell(id,key,val){ setLines(ls=>ls.map(l=> l.temp_id===id ? {...l, [key]:val} : l)); }
  function removeLine(id){ setLines(ls=>ls.filter(l=> l.temp_id!==id)); }

  async function save(){
    if (!purchaseDate || !supplierId || lines.length===0) return;
    const payload = {
      purchase_date: purchaseDate,
      supplier_id: supplierId,
      payment_status: paymentStatus,
      items: lines.map(l=>({
        product_id:Number(l.product_id),
        quantity:Number(l.quantity||0),
        unit_cost:Number(l.unit_cost||0),
        qty_received:Number(l.qty_received||0)
      }))
    };
    const r = await fetch(`${API}/purchases/bulk`, {
      method:"POST", headers:{ "Content-Type":"application/json" }, credentials:"include", body:JSON.stringify(payload)
    });
    const j = await r.json();
    if (!r.ok) return alert(j?.error || "Failed to save purchase");
    window.history.back();
  }

  const fieldSx = {
    "& .MuiInputBase-root": { minHeight: 44 },
    "& .MuiFormHelperText-root": { minHeight: 20 },
  };

  const pageSx = { p:{ xs:2, sm:3 }, bgcolor:"#f9fafb", minHeight:"100vh" };
  const contentSx = { maxWidth:1300, mx:"auto" };

  const supplierName = supplierId
    ? (suppliers.find(s=>String(s.supplier_id)===String(supplierId))?.supplier_name || "")
    : "";

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
            flexWrap: "nowrap",          // never wrap to next line
            overflowX: "auto",           // allow horizontal scroll on very small screens
            pb: 1                         // avoid scrollbar overlay
          }}
        >
          {/* LEFT column (editor) */}
          <Grid item xs={8} md={8} lg={9}>
            <CreatePurchaseComponent
              // header
              purchaseDate={purchaseDate} setPurchaseDate={setPurchaseDate}
              supplierId={supplierId} setSupplierId={(v)=>{ setSupplierId(v); setLines([]); setPId(""); }}
              paymentStatus={paymentStatus} setPaymentStatus={setPaymentStatus}
              suppliers={suppliers} productsForSupplier={productsForSupplier}
              globalStatus={globalStatus}
              PS={PS} DS={DS}

              // add-line
              pId={pId} qty={qty} unit={unit} recv={recv}
              onSelectProduct={onSelectProduct}
              setQty={setQty} setUnit={setUnit} setRecv={setRecv}
              addTotal={addTotal} addRemain={addRemain} addStatus={addStatus}
              onAddLine={addLine}

              // table
              lines={lines} onUpdateCell={updateCell} onRemoveLine={removeLine}
              grandTotal={grandTotal}

              fieldSx={fieldSx} peso={peso}
            />

            {/* Actions */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={()=>window.history.back()}>Cancel</Button>
              <Button variant="contained" onClick={save} disabled={!purchaseDate || !supplierId || !lines.length}>
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
              minWidth: 300           
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
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
