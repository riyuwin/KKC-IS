import React from "react";
import { Card, CardContent, Typography, Stack, Divider, Chip } from "@mui/material";

export default function ProductCreationSummary({
  itemsCount,
  totalInitialStock,
  totalInventoryCost,
  totalPotentialRevenue,
  vatMode = "non-vat",
  lines = [],
  peso,
}) {
  const ellipsisTextSx = {
    maxWidth: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  const VAT_RATE = 0.12; // PH VAT 12%

  // Compute VAT according to mode
  let netSales;   // sales before VAT
  let vatAmount;  // VAT portion
  let grossSales; // sales including VAT

  if (vatMode === "ext-vat") {
    // prices are VAT-exclusive: add 12% on top
    netSales = totalPotentialRevenue;
    vatAmount = netSales * VAT_RATE;
    grossSales = netSales + vatAmount;
  } else if (vatMode === "inc-vat") {
    // prices are VAT-inclusive: extract 12/112 portion
    grossSales = totalPotentialRevenue;
    vatAmount = grossSales * (VAT_RATE / (1 + VAT_RATE)); // 12/112
    netSales = grossSales - vatAmount;
  } else {
    // non-vat
    netSales = totalPotentialRevenue;
    vatAmount = 0;
    grossSales = totalPotentialRevenue;
  }

  const estGrossProfit = netSales - totalInventoryCost;

  const vatModeLabel =
    vatMode === "inc-vat"
      ? "VAT Inclusive (12%)"
      : vatMode === "ext-vat"
      ? "VAT Exclusive (12%)"
      : "Non-VAT";

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Products Summary
        </Typography>

        {/* Overview section */}
        <Stack spacing={1.0} sx={{ mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Overview
          </Typography>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Products to create</Typography>
            <Typography>{itemsCount}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Total initial stock</Typography>
            <Typography>{totalInitialStock}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary">VAT mode</Typography>
            <Chip size="small" label={vatModeLabel} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Value & VAT summary */}
        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Inventory cost (stock × cost price)
            </Typography>
            <Typography>{peso(totalInventoryCost)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Sales base (before VAT)
            </Typography>
            <Typography>{peso(netSales)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Output VAT (12%)
            </Typography>
            <Typography>{peso(vatAmount)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>
              Total with VAT
            </Typography>
            <Typography fontWeight={700}>{peso(grossSales)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Est. gross profit (sales base − cost)
            </Typography>
            <Typography>{peso(estGrossProfit)}</Typography>
          </Stack>
        </Stack>

        {/* Per-product list */}
        {lines.length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="subtitle2" gutterBottom>
              Products
            </Typography>
            <Stack spacing={0.75}>
              {lines.slice(0, 5).map((l) => {
                const stock = Number(l.stock || 0);
                const cost =
                  l.cost_price === "" ? 0 : Number(l.cost_price || 0);
                const price =
                  l.selling_price === "" ? 0 : Number(l.selling_price || 0);

                const lineBaseSales = price * stock;       // before VAT logic
                const lineCost = stock * cost;

                return (
                  <Stack
                    key={l.temp_id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      sx={{ ...ellipsisTextSx, mr: 1, flex: 1, minWidth: 0 }}
                      title={l.product_name}
                    >
                      {l.product_name}
                    </Typography>
                    <Typography sx={{ whiteSpace: "nowrap" }}>
                      {stock} × {peso(price || cost)} = {peso(lineBaseSales || lineCost)}
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
