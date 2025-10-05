import React from "react";
import { Card, CardContent, Typography, Stack, Divider, Chip } from "@mui/material";

export default function PurchaseOrderSummary({
  supplierName, purchaseDate, paymentStatus,
  itemsCount, subtotal, vat, total,
  globalStatus, totalQtyOrdered, totalQtyReceived, totalQtyOutstanding, outstandingValue,
  lines = [], peso,
}) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>Order Summary</Typography>

        <Stack spacing={1.0} sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">Supplier</Typography>
          <Typography>{supplierName || "—"}</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Date</Typography>
          <Typography>{purchaseDate || "—"}</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Payment Status</Typography>
          <Chip size="small" label={paymentStatus} />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Items</Typography>
            <Typography>{itemsCount}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{peso(subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">VAT (12%)</Typography>
            <Typography>{peso(vat)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={700}>{peso(total)}</Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.75} sx={{ mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary">Delivery Status</Typography>
            <Chip size="small" color={globalStatus === "Completed" ? "success" : "warning"} label={globalStatus} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Ordered Qty</Typography>
            <Typography>{totalQtyOrdered}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Received Qty</Typography>
            <Typography>{totalQtyReceived}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Outstanding Qty</Typography>
            <Typography>{totalQtyOutstanding}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Outstanding Value</Typography>
            <Typography>{peso(outstandingValue)}</Typography>
          </Stack>
        </Stack>

        {lines.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom>Items</Typography>
            <Stack spacing={0.75}>
              {lines.slice(0,5).map(l=>{
                const lineTotal = Number(l.quantity||0)*Number(l.unit_cost||0);
                return (
                  <Stack key={l.temp_id} direction="row" justifyContent="space-between">
                    <Typography sx={{ mr: 1, flex: 1, minWidth: 0 }} noWrap title={l.product_name}>
                      {l.product_name}
                    </Typography>
                    <Typography sx={{ whiteSpace: "nowrap" }}>
                      {`${l.quantity} × ${peso(l.unit_cost)} = ${peso(lineTotal)}`}
                    </Typography>
                  </Stack>
                );
              })}
              {lines.length > 5 && (
                <Typography variant="caption" color="text.secondary">
                  + {lines.length - 5} more…
                </Typography>
              )}
            </Stack>
          </>
        )}
      </CardContent>
    </Card>
  );
}
