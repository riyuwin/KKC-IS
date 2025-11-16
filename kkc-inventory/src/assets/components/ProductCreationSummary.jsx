import React from "react";
import { Card, CardContent, Typography, Stack, Divider } from "@mui/material";

export default function ProductCreationSummary({
  itemsCount,
  totalInitialStock,
  totalInventoryCost,
  totalPotentialRevenue,
  lines = [],
  peso,
}) {
  const ellipsisTextSx = {
    maxWidth: "100%",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  };

  const VAT_RATE = 0.12; // example VAT rate (12%)
  const estVat = totalPotentialRevenue * VAT_RATE;
  const totalWithVat = totalPotentialRevenue + estVat;
  const estGrossProfit = totalPotentialRevenue - totalInventoryCost;

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Products Summary
        </Typography>

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
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={0.75}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Inventory cost (stock × cost price)
            </Typography>
            <Typography>{peso(totalInventoryCost)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Potential sales (stock × selling price)
            </Typography>
            <Typography>{peso(totalPotentialRevenue)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Example VAT (12% of potential sales)
            </Typography>
            <Typography>{peso(estVat)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>
              Potential sales + VAT
            </Typography>
            <Typography fontWeight={700}>{peso(totalWithVat)}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">
              Est. gross profit (sales − cost)
            </Typography>
            <Typography>
              {peso(estGrossProfit)}
            </Typography>
          </Stack>
        </Stack>

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
                const lineCost = stock * cost;
                const lineSales = stock * price;

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
                      {stock} × {peso(price || cost)} = {peso(lineSales || lineCost)}
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
