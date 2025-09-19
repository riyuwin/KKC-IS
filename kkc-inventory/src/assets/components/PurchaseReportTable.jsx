import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, CircularProgress, Tooltip, Chip, Stack
} from "@mui/material";
import { MdVisibility } from "react-icons/md";
import PurchasesCRUD from "../logics/purchases/PurchasesCRUD";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import PurchaseDialog from "../components/PurchaseDialog";
import { PortSuppliers, PortProducts } from "../api_ports/api";
import SearchBar from "../components/SearchBar";
import TablePager from "../components/TablePager";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
    BarChart, Bar, XAxis, YAxis
} from "recharts";

function peso(n) {
    if (n === "" || n === null || typeof n === "undefined") return "";
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return num.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2
    });
}

function dateFormat(v) {
    if (!v) return "";
    if (typeof v === "string") {
        const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
        if (m) {
            const [y, mo, d] = m[1].split("-").map(Number);
            const dt = new Date(y, mo - 1, d);
            return dt.toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric"
            });
        }
    }
    const dt = new Date(v);
    if (Number.isNaN(dt.getTime())) return String(v);
    return dt.toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric"
    });
}

function PurchaseReportTable({ duration, setDataToExport }) {
    const [rows, setRows] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [search, setSearch] = useState("");
    const [searchNow, setSearchNow] = useState("");

    const [open, setOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState("create");
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({});

    const [order, setOrder] = useState("desc");
    const [orderBy, setOrderBy] = useState("purchase_date");

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    useEffect(() => {
        const t = setTimeout(() => setSearchNow(search), 150);
        return () => clearTimeout(t);
    }, [search]);

    async function loadMeta() {
        try {
            const [sres, pres] = await Promise.all([fetch(PortSuppliers), fetch(PortProducts)]);
            const [sups, prods] = await Promise.all([sres.json(), pres.json()]);
            setSuppliers(Array.isArray(sups) ? sups : []);
            setProducts(Array.isArray(prods) ? prods : []);
        } catch (e) {
            console.error(e);
        }
    }

    async function load() {
        setLoading(true);
        try {
            const data = await PurchasesCRUD.fetchPurchases(searchNow);
            setRows(Array.isArray(data) ? data : []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadMeta(); }, []);
    useEffect(() => { load(); }, [searchNow]);
 
    const filteredRows = useMemo(() => {
        if (duration?.startDate && duration?.endDate) {
        const start = new Date(duration.startDate);
        const end = new Date(duration.endDate);
        end.setHours(23, 59, 59, 999);

        return rows.filter(r => {
            const purchaseDate = new Date(r.purchase_date);
            return purchaseDate >= start && purchaseDate <= end;
        });
        }

        return [];  
    }, [rows, duration]);
 
    useEffect(() => {
        setDataToExport(filteredRows);
    }, [filteredRows, setDataToExport]);


    const computedRows = useMemo(
        () => filteredRows.map(r => ({
            ...r,
            display_total_cost: r.total_cost ?? r.purchase_total_cost ?? 0
        })),
        [filteredRows]
    );

    const sortedRows = useMemo(
        () => stableSort(computedRows, getComparator(order, orderBy)),
        [computedRows, order, orderBy]
    );
 
    const purchasePaymentSummary = useMemo(() => {
        const map = {};
        filteredRows.forEach(r => {
            const key = r.purchase_payment_status || "Unknown";
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map).map(([name, qty]) => ({ name, qty }));
    }, [filteredRows]);

    const purchaseDeliverySummary = useMemo(() => {
        const map = {};
        filteredRows.forEach(r => {
            const key = r.purchase_status || "Unknown";
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map).map(([name, qty]) => ({ name, qty }));
    }, [filteredRows]);

    const purchaseSummaryByProduct = useMemo(() => {
        const map = {};
        filteredRows.forEach(r => {
            const key = r.product_name || "Unknown";
            map[key] = (map[key] || 0) + (Number(r.quantity) || 0);
        });
        return Object.entries(map).map(([name, qty]) => ({ name, qty }));
    }, [filteredRows]);

    const purchaseSummaryByDate = useMemo(() => {
        const map = {};
        filteredRows.forEach(r => {
            const date = new Date(r.purchase_date);
            if (!isNaN(date)) {
                const key = date.toLocaleDateString("en-US", {
                    month: "short", day: "numeric", year: "numeric",
                });
                map[key] = (map[key] || 0) + 1;
            }
        });
        return Object.entries(map).map(([name, count]) => ({ name, count }));
    }, [filteredRows]);
 
    const COLORS = ["#E67600", "#f9a03f", "#FFBB28", "#FF8042", "#82ca9d"];

    const headerCellSx = {
        py: 3.0, px: 0.75, fontSize: "0.90rem", fontWeight: 700,
        bgcolor: "#706f6fff", textAlign: "center", color: "white",
    };
    const bodyCellSx = {
        textAlign: "center",
        fontSize: "0.90rem",
        py: 2,
        px: 1,
        overflow: "hidden",
        textOverflow: "ellipsis",
    };
    const wrapCellSx = {
        whiteSpace: "normal",
        wordBreak: "break-word",
        textOverflow: "clip",
        overflow: "visible",
        maxWidth: "none",
        px: 1.25,
    };

    const closeDialog = () => { setOpen(false); setSelectedId(null); setFormData({}); };
    const openView = (row) => {
        setDialogMode("view");
        setSelectedId(row.purchase_id);
        setFormData({
            purchase_date: row.purchase_date,
            supplier_id: row.supplier_id,
            product_id: row.product_id,
            quantity: row.quantity,
            unit_cost: row.unit_cost,
            total_cost: row.total_cost,
            purchase_status: row.purchase_status,
            qty_received: row.qty_received,
            purchase_payment_status: row.purchase_payment_status,
        });
        setOpen(true);
    };

    return (
        <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 5, mt: 0 }}>
                    Purchase
                </Typography>
                <Stack direction="row" spacing={2}>
                    <SearchBar search={search} onSearchChange={setSearch} placeholder="Search purchases..." />
                </Stack>
            </Stack>

            {/* Table */}
            <Paper elevation={1} sx={{ mt: 5, borderRadius: 2, bgcolor: "transparent", boxShadow: "none" }}>
                <TableContainer
                    component={Paper}
                    sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}
                >
                    <TablePager data={sortedRows} resetOn={`${order}-${orderBy}-${searchNow}-${duration?.startDate}-${duration?.endDate}`} initialRowsPerPage={5} align="left">
                        {({ pagedRows, Pagination }) => (
                            <>
                                <Table size="small" sx={{ tableLayout: "fixed" }}>
                                    <colgroup>
                                        <col style={{ width: "7%" }} />
                                        <col style={{ width: "9%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "11%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "9%" }} />
                                        <col style={{ width: "7%" }} />
                                        <col style={{ width: "8%" }} />
                                        <col style={{ width: "10%" }} />
                                        <col style={{ width: "8%" }} />
                                        <col style={{ width: "8%" }} />
                                    </colgroup>

                                    <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                                        <TableRow>
                                            <SortableHeader id="no." label="No." order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="purchase_date" label="Date" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="supplier_name" label="Supplier" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="product_name" label="Product" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="quantity" label="Purchased" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="qty_received" label="Received" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="remaining" label="Remaining" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="unit_cost" label="Unit ₱" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="total_cost" label="Total ₱" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="purchase_status" label="Order" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="purchase_payment_status" label="Payment" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <TableCell sx={headerCellSx}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={12}>
                                                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                                                        <CircularProgress size={18} />
                                                        <Typography variant="body2">Loading…</Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ) : pagedRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={12}>
                                                    <Typography variant="body2" color="text.secondary" py={2}>
                                                        No purchases found.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pagedRows.map((row, index) => (
                                                <TableRow key={`${row.purchase_id}-${row.purchase_item_id}`}>
                                                    <TableCell sx={wrapCellSx}>{index + 1}</TableCell>
                                                    <TableCell sx={wrapCellSx}>{dateFormat(row.purchase_date)}</TableCell>
                                                    <TableCell title={row.supplier_name}>{row.supplier_name}</TableCell>
                                                    <TableCell title={row.product_name}>{row.product_name}</TableCell>
                                                    <TableCell title={String(row.quantity)}>{row.quantity}</TableCell>
                                                    <TableCell title={String(row.qty_received)}>{row.qty_received}</TableCell>
                                                    <TableCell title={String(row.remaining)}>{row.remaining}</TableCell>
                                                    <TableCell title={peso(row.unit_cost)}>{peso(row.unit_cost)}</TableCell>
                                                    <TableCell title={peso(row.total_cost)}>{peso(row.total_cost)}</TableCell>
                                                    <TableCell sx={wrapCellSx}>
                                                        <Chip
                                                            size="small"
                                                            color={row.remaining === 0 ? "success" : "warning"}
                                                            label={row.purchase_status}
                                                            sx={{ px: 0.9, maxWidth: "none" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={wrapCellSx}>{row.purchase_payment_status}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" justifyContent="center" spacing={-0.4}>
                                                            <Tooltip title="View">
                                                                <IconButton size="small" color="success" onClick={() => openView(row)}>
                                                                    <MdVisibility style={{ fontSize: 22 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                                <Pagination />
                            </>
                        )}
                    </TablePager>
                </TableContainer>
            </Paper>

            {/* Charts */}
            <Stack sx={{ mt: 5 }} direction={{ xs: "column", md: "row" }} spacing={4}>
                {/* Pie Chart: Payment Status */}
                <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Purchase Payment Status
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={purchasePaymentSummary} dataKey="qty" nameKey="name" outerRadius={100} label>
                                {purchasePaymentSummary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <ReTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Pie Chart: Delivery Status */}
                <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Purchase Delivery Status
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={purchaseDeliverySummary} dataKey="qty" nameKey="name" outerRadius={100} label>
                                {purchaseDeliverySummary.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <ReTooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Stack>

            <Stack sx={{ mt: 5 }} direction={{ xs: "column", md: "row" }} spacing={4}>
                {/* Bar Chart: Purchased Quantity per Product */}
                <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Purchased Quantity per Product
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={purchaseSummaryByProduct}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ReTooltip />
                            <Legend />
                            <Bar dataKey="qty" fill="#E67600" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                {/* Bar Chart: Purchases by Date */}
                <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                        Purchases by Date
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={purchaseSummaryByDate}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ReTooltip />
                            <Legend />
                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                {purchaseSummaryByDate.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Stack>


            <PurchaseDialog
                open={open}
                mode={dialogMode}
                initialData={formData}
                suppliers={suppliers}
                products={products}
                onClose={closeDialog}
                onSwitchToEdit={() => setDialogMode("edit")}
                onSubmit={async (payload) => {
                    try {
                        const isCreate = dialogMode === "create";
                        const res = isCreate
                            ? await PurchasesCRUD.createPurchase(payload)
                            : await PurchasesCRUD.updatePurchase(selectedId, payload);
                        if (res?.cancelled) return;
                        closeDialog();
                        await load();
                    } catch {
                        // handled in PurchasesCRUD
                    }
                }}
            />
        </Box>
    );
}

export default PurchaseReportTable;
