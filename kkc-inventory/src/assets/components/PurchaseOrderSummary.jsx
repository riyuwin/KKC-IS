import React from "react";
import { Card, CardContent, Typography, Stack, Divider, Chip } from "@mui/material";

export default function PurchaseOrderSummary({
  supplierName,
  purchaseDate,
  paymentStatus,
  itemsCount,
  subtotal,
  vat,
  total,
  globalStatus,
  totalQtyOrdered,
  totalQtyReceived,
  totalQtyOutstanding,
  outstandingValue,
  lines = [],
  peso,
  vatRate = 0.12,
  vatMode = "non-vat",
}) {
  const valueEllipsisSx = {
    textAlign: "right",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "60%",
  };

  const labelSx = { color: "text.secondary" };

  const vatPercentLabel = `${Math.round((vatRate || 0) * 100)}%`;

  const vatModeLabel = (() => {
    switch (vatMode) {
      case "inc-vat":
        return `VAT Inclusive (${vatPercentLabel})`;
      case "ext-vat":
        return `VAT Exclusive (${vatPercentLabel})`;
      default:
        return `Non-VAT (${vatPercentLabel})`;
    }
  })();

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 3,
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom noWrap>
          Order Summary
        </Typography>

        <Stack spacing={1.0} sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={labelSx}>
            Supplier
          </Typography>
          <Typography
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={supplierName}
          >
            {supplierName || "—"}
          </Typography>

          <Typography variant="body2" sx={{ ...labelSx, mt: 1 }}>
            Date
          </Typography>
          <Typography noWrap title={purchaseDate}>
            {purchaseDate || "—"}
          </Typography>

          <Typography variant="body2" sx={{ ...labelSx, mt: 1 }}>
            Payment Status
          </Typography>
          <Chip
            size="small"
            label={paymentStatus || "—"}
            sx={{ maxWidth: "100%" }}
          />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Items</Typography>
            <Typography sx={valueEllipsisSx}>{itemsCount}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Subtotal</Typography>
            <Typography sx={valueEllipsisSx}>{peso(subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            {/* UPDATED: show proper VAT label based on mode */}
            <Typography sx={labelSx}>VAT - {vatModeLabel}</Typography>
            <Typography sx={valueEllipsisSx}>{peso(vat)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={700}>Total</Typography>
            <Typography fontWeight={700} sx={valueEllipsisSx}>
              {peso(total)}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.75} sx={{ mb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Delivery Status</Typography>
            <Chip
              size="small"
              color={globalStatus === "Completed" ? "success" : "warning"}
              label={globalStatus}
              sx={{ maxWidth: "100%" }}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Ordered Qty</Typography>
            <Typography sx={valueEllipsisSx}>{totalQtyOrdered}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Received Qty</Typography>
            <Typography sx={valueEllipsisSx}>{totalQtyReceived}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Outstanding Qty</Typography>
            <Typography sx={valueEllipsisSx}>{totalQtyOutstanding}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={labelSx}>Outstanding Value</Typography>
            <Typography sx={valueEllipsisSx}>{peso(outstandingValue)}</Typography>
          </Stack>
        </Stack>

        {lines.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom>
              Items
            </Typography>
            <Stack spacing={0.75}>
              {lines.slice(0, 5).map((l) => {
                const lineTotal =
                  Number(l.quantity || 0) * Number(l.unit_cost || 0);
                return (
                  <Stack
                    key={l.temp_id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ gap: 1 }}
                  >
                    <Typography
                      sx={{ mr: 1, flex: 1, minWidth: 0 }}
                      noWrap
                      title={l.product_name}
                    >
                      {l.product_name}
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={`${l.quantity} × ${peso(l.unit_cost)} = ${peso(
                        lineTotal
                      )}`}
                    >
                      {`${l.quantity} × ${peso(l.unit_cost)} = ${peso(
                        lineTotal
                      )}`}
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
