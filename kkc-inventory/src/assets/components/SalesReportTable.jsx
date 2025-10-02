import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, TextField, Button, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Tooltip, Chip, Stack } from "@mui/material";
import { MdSearch, MdAdd, MdVisibility, MdEdit, MdDelete } from "react-icons/md";
import Swal from "sweetalert2";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import SalesDialog from "../components/SalesDialog";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import { InsertSales, RetrieveSales, UpdateSales } from "../logics/admin/ManageSales";
import SearchBar from "../components/SearchBar";
import { bodyCellSx, headerCellSx } from "../components/TableLayout";
import { dateFormat } from "../components/DateFormat";
import TablePager from "../components/TablePager";
import { FetchCurrentUser } from "../logics/auth/FetchCurentUser";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from "recharts";
import { Divider } from "@mui/material";

function SalesReportTable({ duration, setDataToExport }) {

    /* console.log("Duration123: ", duration);


    console.log("End DATE: ", duration?.endDate);
    console.log("STATRT DATE: ", duration?.startDate); */

    // Modal Variables States
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState(null);
    // Dynamics Variable States
    const [sales, setSales] = useState([]);
    const [salesItems, setSalesItems] = useState([]);
    const [salesDeliveries, setSalesDeliveries] = useState([]);
    const [salesAttachments, setSalesAttachments] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesData, setSalesData] = useState({});
    const accountDetails = FetchCurrentUser();
    const [salesId, setSalesId] = useState(null);

    // Filter Variables
    const [search, setSearch] = useState("");

    const DialogHandler = (selectedDialogMode, data) => {
        setDialogMode(selectedDialogMode);
        setDialogOpen(true);

        if (selectedDialogMode == "View" || selectedDialogMode == "Edit") {
            console.log("Selected Data: ", data)
            setSalesData(data);
            setSalesId(data?.sale?.sales_id);
        }
    };

    // Data Fetcher 
    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Sales
                const { data: salesData } = await RetrieveSales();
                /* setSales(salesData.sales); */

                if (duration?.startDate && duration?.endDate) {
                    const start = new Date(duration.startDate);
                    const end = new Date(duration.endDate);

                    const filteredSales = salesData.sales.filter(sale => {
                        const saleDate = new Date(sale.sale_date);
                        return saleDate >= start && saleDate <= end;
                    });

                    setSales(filteredSales);
                } else {
                    // setSales(salesData.sales);
                }


                setSalesDeliveries(salesData.deliveries);
                setSalesItems(salesData.items);
                setSalesAttachments(salesData.attachments);

                // Warehouses
                const { data: warehouseData } = await RetrieveWarehouse();
                setWarehouses(warehouseData);
                /* console.log("Warehouses:", warehouseData); */

                // Products
                const productData = await ProductsCRUD.fetchProducts();
                setProducts(productData);
                /* console.log("Products:", productData); */
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        fetchAll();
        const interval = setInterval(fetchAll, 2000);
        return () => clearInterval(interval);
    }, [duration]);

    const handleSalesSubmit = (formData, dialogMode, selectedSalesId) => {
        const payload = {
            ...formData,
            account_id: accountDetails?.account_id,
        };

        if (dialogMode.toLowerCase() == "edit") {
            console.log("HATDOG")
            UpdateSales(selectedSalesId, payload)
        } else if (dialogMode.toLowerCase() == "add") {
            InsertSales(payload);
        }

        /* console.log("Sales Payload:", payload);
        console.log("accountDetails?.account_id accountDetails?.account_id:", accountDetails?.account_id); */
    };

    const [order, setOrder] = useState("desc");
    const [orderBy, setOrderBy] = useState("sale_date");
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const sortedRows = useMemo(() => {
        const filtered = sales.filter((s) => {
            const p = products.find((p) => p.product_id === s.product_id);

            return (
                s.sale_payment_status.toLowerCase().includes(search.toLowerCase()) ||
                s.delivery_status.toLowerCase().includes(search.toLowerCase()) ||
                s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
                (p &&
                    (p.product_name.toLowerCase().includes(search.toLowerCase()) ||
                        p.supplier_id.toLowerCase().includes(search.toLowerCase())))
            );
        });

        return stableSort(filtered, getComparator(order, orderBy));
    }, [sales, products, search, order, orderBy]);

    useEffect(() => {
        if (setDataToExport) {
            const exportData = sortedRows.map((row, index) => {
                const sales_item = salesItems.find((item) => item.sales_id === row.sales_id);
                const p = sales_item ? products.find((prod) => prod.product_id === sales_item.product_id) : null;

                return {
                    "No.": index + 1,
                    "Date": dateFormat(row.sale_date),
                    "Customer": row.customer_name,
                    "Product": p ? p.product_name : "N/A",
                    "Quantity_Sold": sales_item ? sales_item.product_quantity : "N/A",
                    "Selling_Price": p ? p.selling_price : "N/A",
                    "Total": row.total_sale ?? "N/A",
                    "Payment_Status": row.sale_payment_status,
                    "Delivery_Status": row.delivery_status,
                };
            });

            setDataToExport(exportData);
        }
    }, [sortedRows, salesItems, products, setDataToExport]);

    const salesSummary = useMemo(() => {
        const summary = {};
        salesItems.forEach((item) => {
            const product = products.find((p) => p.product_id === item.product_id);
            if (product) {
                summary[product.product_name] =
                    (summary[product.product_name] || 0) + Number(item.product_quantity);
            }
        });

        return Object.entries(summary).map(([name, qty]) => ({ name, qty }));
    }, [salesItems, products]);

    const salesPaymentSummary = useMemo(() => {
        const summary = {};

        sales.forEach((sale) => {
            const sales_item = salesItems.find((item) => item.sales_id === sale.sales_id);
            const status = sales_item ? sale.sale_payment_status : "Unknown";

            if (!summary[status]) {
                summary[status] = 0;
            }
            summary[status] += 1; // bilangin lang kada status
        });

        return Object.entries(summary).map(([name, qty]) => ({ name, qty }));
    }, [sales, salesItems]);

    const salesDeliverySummary = useMemo(() => {
        const summary = {};

        sales.forEach((sale) => {
            const sales_item = salesItems.find((item) => item.sales_id === sale.sales_id);
            const status = sales_item ? sale.delivery_status : "Unknown";

            if (!summary[status]) {
                summary[status] = 0;
            }
            summary[status] += 1;
        });

        return Object.entries(summary).map(([name, qty]) => ({ name, qty }));
    }, [sales, salesItems]);


    const salesDateSummary = useMemo(() => {
        const summary = {};

        sales.forEach((sale) => {
            const date = dateFormat(sale.sale_date);

            if (!summary[date]) {
                summary[date] = 0;
            }
            summary[date] += 1;
        });

        return Object.entries(summary).map(([name, count]) => ({
            name,
            count,
        }));
    }, [sales]);

    const COLORS = ["#E67600", "#f9a03f", "#FFBB28", "#FF8042", "#82ca9d"];

    return (
        < >
            <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 5, mt: 0 }}>
                        Sales Report
                    </Typography>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
                        <Stack direction="row" spacing={2}>
                            <SearchBar
                                search={search}
                                onSearchChange={setSearch}
                            />
                        </Stack>
                    </Stack>

                </Stack>

                <Paper elevation={1} sx={{ mt: 5, borderRadius: 2, bgcolor: "transparent", boxShadow: "none" }}>
                    <TableContainer
                        component={Paper}
                        sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}
                    >
                        <TablePager
                            data={sortedRows}
                            resetOn={`${order}-${orderBy}-${search}`}
                            initialRowsPerPage={10}
                            align="left"
                        >
                            {({ pagedRows, Pagination, page, rowsPerPage }) => (
                                <>
                                    <Table size="small" sx={{ tableLayout: "fixed" }}>
                                        <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                                            <TableRow>
                                                <SortableHeader id="number" label="No." order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "5%" }} />
                                                <SortableHeader id="sale_date" label="Date" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "10%" }} />
                                                <SortableHeader id="customer_name" label="Customer/Company Name" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "20%" }} />
                                                <SortableHeader id="product" label="Product" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "15%" }} />
                                                <SortableHeader id="quantity" label="Quantity Sold" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "10%" }} />
                                                <SortableHeader id="selling_price" label="Selling Price" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "10%" }} />
                                                <SortableHeader id="total_sale" label="Total" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "10%" }} />
                                                <SortableHeader id="sale_payment_status" label="Payment Status" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "10%" }} />
                                                <SortableHeader id="delivery_status" label="Delivery Status" order={order} orderBy={orderBy} onSort={handleSort} sx={{ width: "10%" }} />
                                                <TableCell sx={{ width: "10%" }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>

                                        <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                                            {pagedRows.map((row, index) => {
                                                const sales_item = salesItems.find((item) => item.sales_id === row.sales_id);
                                                const p = sales_item ? products.find((prod) => prod.product_id === sales_item.product_id) : null;
                                                const sales_deliveries = sales_item ? salesDeliveries.find((d) => d.sales_item_id === sales_item.sales_item_id) : null;

                                                const sales_attachments = sales_item
                                                    ? salesAttachments.filter((d) => d.sales_delivery_id === sales_deliveries?.sales_delivery_id)
                                                    : [];

                                                const globalIndex = page * rowsPerPage + index + 1;

                                                const rowData = {
                                                    sale: row,
                                                    sales_item,
                                                    product: p,
                                                    deliveries: sales_deliveries,
                                                    attachments: sales_attachments,
                                                };

                                                return (
                                                    <TableRow key={row.sale_id ?? globalIndex}>
                                                        <TableCell>{globalIndex}</TableCell>
                                                        <TableCell>{dateFormat(row.sale_date)}</TableCell>
                                                        <TableCell>{row.customer_name}</TableCell>
                                                        <TableCell>{p ? p.product_name : "Null"}</TableCell>
                                                        <TableCell>{sales_item ? sales_item.product_quantity : "Null"}</TableCell>
                                                        <TableCell>{p ? p.selling_price : "Null"}</TableCell>
                                                        <TableCell>{row.total_sale ?? "Null"}</TableCell>
                                                        <TableCell>
                                                            <Chip size="small" color={row.sale_payment_status === "Fully Paid'" ? "success" : "warning"} label={row.sale_payment_status} sx={{ px: 0.9, maxWidth: "none" }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip size="small" color={row.delivery_status === "Delivered" ? "success" : "warning"} label={row.delivery_status} sx={{ px: 0.9, maxWidth: "none" }} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Stack direction="row" justifyContent="center" spacing={0.5}>
                                                                <Tooltip title="View">
                                                                    <IconButton size="small" color="success" onClick={() => DialogHandler("View", rowData)}>
                                                                        <MdVisibility style={{ fontSize: 22 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Stack>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>

                                    <Box display="flex" justifyContent="flex-end" p={2}>
                                        <Pagination size="small" />
                                    </Box>
                                </>
                            )}
                        </TablePager>
                    </TableContainer>
                </Paper>

                <SalesDialog
                    open={dialogOpen}
                    mode={dialogMode}
                    accountId={accountDetails?.account_id}
                    salesId={salesId}
                    productsData={products}
                    warehousesData={warehouses}
                    salesData={salesData}
                    initialData={null}
                    onClose={() => setDialogOpen(false)}
                    onSwitchToEdit={null}
                    onSubmit={handleSalesSubmit}
                />

                {/* Divider */}
                <Divider sx={{ my: 4, mt: 5 }} />


                <Stack sx={{ mt: 5 }} direction={{ xs: "column", md: "row" }} spacing={4}>
                    {/* Pie Chart */}
                    <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Payment Status
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={salesPaymentSummary}
                                    dataKey="qty"
                                    nameKey="name"
                                    outerRadius={100}
                                    fill="#E67600"
                                    label
                                >
                                    {salesPaymentSummary.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* Pie Chart */}
                    <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Delivery Status
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={salesDeliverySummary}
                                    dataKey="qty"
                                    nameKey="name"
                                    outerRadius={100}
                                    fill="#E67600"
                                    label
                                >
                                    {salesDeliverySummary.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <ReTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Stack>



                <Stack sx={{ mt: 5 }} direction={{ xs: "column", md: "row" }} spacing={4}>
                    {/* Bar Chart */}
                    <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Quantity Sold per Product
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesSummary}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ReTooltip />
                                <Legend />
                                <Bar dataKey="qty" fill="#E67600" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>

                    {/* Bar Chart */}
                    <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            Sales by Date
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={salesDateSummary}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <ReTooltip />
                                <Legend />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {salesDateSummary.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Stack>

                {/* <Paper sx={{ mt: 4, p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                        Sales by Date
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesDateSummary}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ReTooltip />
                            <Legend />
                            <Bar dataKey="qty" fill="#E67600" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper> */}
            </Box>
        </ >
    );
}

export default SalesReportTable;