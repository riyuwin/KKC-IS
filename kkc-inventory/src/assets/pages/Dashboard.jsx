import * as React from 'react';
import { Container, Box, Card, CardContent, Typography, Chip, ToggleButtonGroup, ToggleButton, Table, TableHead, TableBody, TableRow, TableCell, Divider, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { BarChart } from '@mui/x-charts';
import { PieChart } from '@mui/x-charts/PieChart';
import { PortDashboard } from '../api_ports/api';

const API = PortDashboard;

const peso = (n = 0) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 })
    .format(Number(n || 0));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDaily = s => { const d = new Date(s); return `${d.toLocaleString('en-US', { month: 'short' })} ${String(d.getDate()).padStart(2, '0')}`; };
const fmtMonthly = ym => { const [y, m] = ym.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const fetchJSON = async (url) => { const r = await fetch(url, { credentials: 'include' }); if (!r.ok) throw new Error(url); return r.json(); };

function weekLabel(isoYearWeek) {
  const [y, w] = isoYearWeek.split('-W').map(Number);
  const base = new Date(Date.UTC(y, 0, 1 + (w - 1) * 7));
  const dow = base.getUTCDay();
  const mon = new Date(base); mon.setUTCDate(base.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
  const thu = new Date(mon); thu.setUTCDate(mon.getUTCDate() + 3);
  const month = thu.getUTCMonth();
  const first = new Date(Date.UTC(thu.getUTCFullYear(), month, 1));
  const fdow = first.getUTCDay();
  const firstMon = new Date(first); firstMon.setUTCDate(first.getUTCDate() + (fdow === 0 ? -6 : 1 - fdow));
  const weekInMonth = Math.floor((mon - firstMon) / 86400000 / 7) + 1;
  return `Week ${weekInMonth} of ${MONTHS[month]}`;
}

function KpiCard({ title, icon: Icon, value, iconColor = 'text.primary' }) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2, boxShadow: 3, p: 2.25 }}>
      <CardContent sx={{ p: 0 }}>
        <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.5 }}>
          <Icon sx={{ fontSize: 48, color: iconColor }} />
          <Typography variant="h4" fontWeight={800}>{value}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}


/* Bills row (static pa) */
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

export default function Dashboard() {
  const [loading, setLoading] = React.useState(true);
  const [summary, setSummary] = React.useState(null);
  const [mode, setMode] = React.useState('weekly'); // daily | weekly | monthly
  const [series, setSeries] = React.useState({ labels: [], sales: [], purchases: [] });
  const [outs, setOuts] = React.useState([]);

  // STATIC pie data
  const topStatic = [
    { label: 'Ladder', value: 120 },
    { label: 'U Bolt', value: 50 },
    { label: 'Bulb', value: 32 },
    { label: 'Tape', value: 15 },
    { label: 'Wire', value: 3 },
  ];

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [sum, ser, od] = await Promise.all([
        fetchJSON(`${API}/dashboard/summary`),
        fetchJSON(`${API}/dashboard/series?mode=${mode}`),
        fetchJSON(`${API}/dashboard/outstanding-deliveries?limit=10`)
      ]);
      if (mode === 'daily' && (!ser?.sales?.length || !ser?.purchases?.length)) {
        const z = (ser.labels || []).map(() => 0);
        setSeries({ labels: ser.labels || [], sales: z, purchases: z });
      } else setSeries(ser);
      setSummary(sum);
      setOuts(od);
    } finally { setLoading(false); }
  }, [mode]);

  React.useEffect(() => { loadAll(); }, [loadAll]);

  const whName = summary?.warehouse?.warehouse_name || 'Warehouse';
  const totals = summary?.totals || { sales: 0, purchases: 0, products: 0 };

  const chartTitle =
    mode === 'daily' ? "This Day's Sales and Purchases" :
      mode === 'weekly' ? "This Week's Sales and Purchases" :
        "This Month's Sales and Purchases";

  const xTick = (v) => (mode === 'daily' ? fmtDaily(v) : mode === 'weekly' ? weekLabel(v) : fmtMonthly(v));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h3" fontWeight={700}>Dashboard ({whName})</Typography>
      </Box>

      {/* KPI row — equal widths via CSS Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2,
          mb: 3
        }}
      >
        
        <KpiCard title="Sales" icon={TrendingUpIcon} value={peso(totals.sales)} iconColor="#7C4DFF" />
        <KpiCard title="Purchases" icon={ShoppingCartIcon} value={peso(totals.purchases)} iconColor="#7557c2ff" />
        <KpiCard title="Products" icon={Inventory2Icon} value={totals.products} iconColor="#9575CD"  />
      </Box>

      {/* Sales vs Purchases */}
      <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2, gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>{chartTitle}</Typography>
            <ToggleButtonGroup size="small" value={mode} exclusive onChange={(_, v) => v && setMode(v)}>
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <BarChart
            height={340}
            xAxis={[{ scaleType: 'band', data: series.labels, valueFormatter: (v) => xTick(v), tickLabelStyle: { fontSize: 12 } }]}
            series={[{ data: series.sales, label: 'Sales' }, { data: series.purchases, label: 'Purchases' }]}
            grid={{ horizontal: true }}
            slotProps={{ legend: { direction: 'row', position: { vertical: 'top', horizontal: 'right' } } }}
            sx={{
              '& .MuiBarElement-root': { transition: 'transform 120ms ease' },
              '& .MuiBarElement-root:hover': { transform: 'scaleY(1.08)' },
            }}
          />
        </CardContent>
      </Card>

      {/* Deliveries + Static Top products row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2, mb: 3 }}>
        {/* Outstanding Deliveries */}
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LocalShippingIcon />
              <Typography variant="h6" fontWeight={700}>Outstanding Deliveries</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Where to hugot the dataa
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sales ID</TableCell><TableCell>Date</TableCell><TableCell>Customer</TableCell>
                  <TableCell>Product</TableCell><TableCell align="right">Ordered</TableCell>
                  <TableCell align="right">Delivered</TableCell><TableCell align="right">Remaining</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(outs || []).map(r => {
                  const remaining = Number(r.remaining || 0), status = remaining > 0 ? 'Pending' : 'Completed';
                  return (
                    <TableRow key={`${r.sales_id}-${r.product_id}`}>
                      <TableCell>#{r.sales_id}</TableCell>
                      <TableCell>{new Date(r.sale_date).toLocaleDateString()}</TableCell>
                      <TableCell>{r.customer_name}</TableCell>
                      <TableCell>{r.product_name}</TableCell>
                      <TableCell align="right">{r.total_delivery_quantity}</TableCell>
                      <TableCell align="right">{r.total_delivered}</TableCell>
                      <TableCell align="right"><strong>{remaining}</strong></TableCell>
                      <TableCell><Chip size="small" label={status} color={status === 'Pending' ? 'warning' : 'success'} variant="outlined" /></TableCell>
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

        {/* Static Top Selling Products */}
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Top Selling Products (2025)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Static data muna
            </Typography>
            <PieChart
              height={320}
              series={[{
                data: topStatic.map((t, i) => ({ id: i, label: t.label, value: t.value })),
                innerRadius: 40,
                paddingAngle: 2,
                cornerRadius: 2,
                highlightScope: { faded: 'global', highlighted: 'item' },
                faded: { additionalRadius: -10, innerRadius: -10 },
                valueFormatter: v => `${v.value}`
              }]}
              slotProps={{ legend: { direction: 'column', position: { vertical: 'middle', horizontal: 'right' } } }}
            />
          </CardContent>
        </Card>
      </Box>

      {/* Upcoming bills (static) */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <EventNoteIcon />
            <Typography variant="h6" fontWeight={700}>Upcoming Due Dates (Bills)</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Static muna
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

      {loading && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Loading dashboard…
        </Typography>
      )}
    </Container>
  );
}
