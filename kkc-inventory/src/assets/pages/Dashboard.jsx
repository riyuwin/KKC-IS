import * as React from 'react';
import { Container, Box, Grid, Card, CardContent, Typography, Chip, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell, Divider, Stack } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { BarChart } from '@mui/x-charts';
import { PortDashboard } from '../api_ports/api';

const API = PortDashboard;

const peso = (n=0) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(Number(n||0));

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState(null);
  const [mode, setMode] = React.useState('weekly'); // daily | weekly | monthly
  const [series, setSeries] = React.useState({ labels: [], sales: [], purchases: [] });
  const [outs, setOuts] = React.useState([]);

  const fetchSummary = React.useCallback(async () => {
    const r = await fetch(`${API}/dashboard/summary`, { credentials: 'include' });
    if (!r.ok) throw new Error('Failed to load summary');
    return r.json();
  }, []);

  const fetchSeries = React.useCallback(async (m) => {
    const r = await fetch(`${API}/dashboard/series?mode=${m}`, { credentials: 'include' });
    if (!r.ok) throw new Error('Failed to load series');
    return r.json();
  }, []);

  const fetchOutstanding = React.useCallback(async () => {
    const r = await fetch(`${API}/dashboard/outstanding-deliveries?limit=10`, { credentials: 'include' });
    if (!r.ok) throw new Error('Failed to load outstanding deliveries');
    return r.json();
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [sum, ser, od] = await Promise.all([fetchSummary(), fetchSeries(mode), fetchOutstanding()]);
        setSummary(sum);
        setSeries(ser);
        setOuts(od);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [mode, fetchSummary, fetchSeries, fetchOutstanding]);

  const whName = summary?.warehouse?.warehouse_name || 'Warehouse';
  const totals = summary?.totals || { sales: 0, purchases: 0, products: 0 };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{mt: -7}}>
          Dashboard ({whName})
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Sales</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <AttachMoneyIcon sx={{ fontSize: 50, color: '#1E88E5' }} />
                <Typography variant="h4" fontWeight={800}>{peso(totals.sales)}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Purchases</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <ShoppingCartIcon sx={{ fontSize: 50, color: '#FF9800' }} />
                <Typography variant="h4" fontWeight={800}>{peso(totals.purchases)}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Products</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Inventory2Icon sx={{ fontSize: 50, color: '#4CAF50' }} />
                <Typography variant="h4" fontWeight={800}>{totals.products}</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sales vs Purchases */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>{mode === 'daily' ? "This Day's Sales and Purchases" : (mode === 'weekly' ? "This Week's Sales and Purchases" : "This Month's Sales and Purchases")}</Typography>
            <ToggleButtonGroup
              size="small" value={mode} exclusive onChange={(_, v) => v && setMode(v)}
            >
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {/* Bar Chart */}
          <BarChart
            height={320}
            xAxis={[{ scaleType: 'band', data: series.labels }]}
            series={[
              { data: series.sales, label: 'Sales' },
              { data: series.purchases, label: 'Purchases' },
            ]}
            slotProps={{
              legend: { direction: 'row', position: { vertical: 'top', horizontal: 'right' } },
              bars: {
                style: {
                  transition: 'width 0.3s',
                },
                hover: {
                  scale: 1.1,
                },
              },
              grid: {
                show: true,
                lines: {
                  horizontal: { show: true },
                  vertical: { show: true },
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Outstanding deliveries */}
      <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <LocalShippingIcon />
            <Typography variant="h6" fontWeight={700}>Outstanding Deliveries</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Orders with remaining quantities to deliver (warehouse-scoped). Use this to act on pending drop-offs.
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sales ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Ordered</TableCell>
                <TableCell align="right">Delivered</TableCell>
                <TableCell align="right">Remaining</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(outs || []).map((r) => {
                const remaining = Number(r.remaining || 0);
                const status = remaining > 0 ? 'Pending' : 'Completed';
                return (
                  <TableRow key={`${r.sales_id}-${r.product_id}`}>
                    <TableCell>#{r.sales_id}</TableCell>
                    <TableCell>{new Date(r.sale_date).toLocaleDateString()}</TableCell>
                    <TableCell>{r.customer_name}</TableCell>
                    <TableCell>{r.product_name}</TableCell>
                    <TableCell align="right">{r.total_delivery_quantity}</TableCell>
                    <TableCell align="right">{r.total_delivered}</TableCell>
                    <TableCell align="right"><strong>{remaining}</strong></TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={status}
                        color={status === 'Pending' ? 'warning' : 'success'}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {!outs?.length && (
                <TableRow><TableCell colSpan={8}><Typography variant="body2" color="text.secondary">No outstanding deliveries 🎉</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upcoming bills (static) */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <EventNoteIcon />
            <Typography variant="h6" fontWeight={700}>Upcoming Due Dates (Bills)</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Static preview (no backend). We’ll hook this to your real bills module later.
          </Typography>

          <Stack spacing={1}>
            <RowBill name="Electricity" provider="Meralco" due="2025-10-15" amount={3500} />
            <Divider />
            <RowBill name="Water" provider="Maynilad" due="2025-10-18" amount={1200} />
            <Divider />
            <RowBill name="Internet" provider="PLDT Fiber" due="2025-10-20" amount={1999} />
          </Stack>
        </CardContent>
      </Card>


    </Container>
  );
}

function RowBill({ name, provider, due, amount }) {
  const daysLeft = Math.ceil((new Date(due) - new Date()) / 86400000);
  const color = daysLeft <= 3 ? 'error' : daysLeft <= 7 ? 'warning' : 'success';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
      <Typography sx={{ minWidth: 160, fontWeight: 600 }}>{name}</Typography>
      <Typography sx={{ flex: 1 }} color="text.secondary">{provider}</Typography>
      <Chip size="small" label={`Due ${new Date(due).toLocaleDateString()}`} color={color} variant="outlined" />
      <Typography fontWeight={700}>{peso(amount)}</Typography>
    </Box>
  );
}
