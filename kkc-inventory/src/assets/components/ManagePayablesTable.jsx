import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Stack, Chip,
    Button
} from "@mui/material";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import TablePager from "../components/TablePager";
import SearchBar from "../components/SearchBar";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import { MdAdd } from "react-icons/md";
import PayableDialog from "./PayableDialog";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import { InsertBills } from "../logics/bills/ManageBills";

function peso(n) {
    if (n === "" || n === null || typeof n === "undefined") return "";
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}

function ManagePayables({ stockStatus = "", setDataToExport }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchNow, setSearchNow] = useState("");
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("product_name");

    const [openWarehouse, setOpenWarehouse] = useState(false);
    const [openPayablesDialog, setOpenPayablesDialog] = useState(false);
    const [modalType, setModalType] = useState(null);

    // Dynamics Variable States
    const [warehouses, setWarehouses] = useState([]);
    const [users, setUsers] = useState([]);
    const warehouseNames = useMemo(() => warehouses.map((w) => ({ label: w.warehouse_name, value: w.warehouse_id })), [warehouses]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);


    const handleManagePayables = (payload, modal_type) => {
        console.log("Test Add: ", payload);
        if (modal_type == "Add") {
            InsertBills(payload);
        } else if (modal_type == "Edit") {
            UpdateAccount(payload);
        }
    };

    const handlePayablesDialogOpen = (type, bill = null, warehouse = null) => {
        if (type === "Edit" && warehouse) {
            setSelectedWarehouse(warehouse);
            setSelectedUser(bill);
        }

        setModalType(type);
        setOpenPayablesDialog(true);
    };

    // Fetcher
    useEffect(() => {
        const fetchWarehouses = async () => {
            const { data } = await RetrieveWarehouse();
            setWarehouses(data);
        };

        fetchWarehouses();

        const interval = setInterval(fetchWarehouses, 2000);
        return () => clearInterval(interval);
    }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setSearchNow(search), 150);
        return () => clearTimeout(t);
    }, [search]);

    const load = async () => {
        setLoading(true);
        try {
            const data = await ProductsCRUD.fetchProducts(searchNow);
            const result = Array.isArray(data) ? data : data?.results || [];
            setRows(result);
            if (setDataToExport) setDataToExport(result); // send full data to parent for export
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [searchNow]);

    const computedRows = useMemo(() => {
        return rows.map((r) => {
            const stock = Number(r.stock ?? 0);
            const status =
                stock <= 0 ? { label: "Out of Stock", color: "error" } :
                    stock <= 5 ? { label: "Low Stock", color: "warning" } :
                        { label: "In Stock", color: "success" };

            return { ...r, _stockStatus: status };
        });
    }, [rows]);

    // Filter by stockStatus prop
    const filteredRows = useMemo(() => {
        if (!stockStatus) return computedRows;
        return computedRows.filter(row => {
            const status = row._stockStatus.label.toLowerCase().replace(" ", "_");
            return status === stockStatus;
        });
    }, [computedRows, stockStatus]);


    const sortedRows = useMemo(
        () => stableSort(filteredRows, getComparator(order, orderBy)),
        [filteredRows, order, orderBy]
    );

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const headerCellSx = {
        p: 1.5, fontSize: "0.95rem", fontWeight: 700,
        bgcolor: "#706f6fff", textAlign: "center", color: "white",
    };
    const bodyCellSx = { textAlign: "center", fontSize: "0.90rem", py: 2, px: 1 };

    return (
        <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
            <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4, px: 1 }} spacing={2}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 5, mt: 0 }}>
                        Manage Payables
                    </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
                        <Stack direction="row" spacing={2}>
                            <SearchBar
                                search={search}
                                onSearchChange={setSearch}
                            />
                        </Stack>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<MdAdd />}
                        sx={{ bgcolor: "#E67600", "&:hover": { bgcolor: "#f99f3fff" }, textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                        onClick={() => { handlePayablesDialogOpen("Add") }}
                    >
                        Add Payables
                    </Button>
                </Stack>


                <Paper elevation={1} sx={{ mt: 5, borderRadius: 2, bgcolor: "transparent" }}>
                    <TableContainer
                        component={Paper}
                        sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}
                    >
                        <TablePager data={sortedRows} resetOn={`${order}-${orderBy}-${searchNow}`} initialRowsPerPage={10}>
                            {({ pagedRows, Pagination }) => (
                                <>
                                    <Table size="small">
                                        <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                                            <TableRow>
                                                <SortableHeader id="no" label="No." order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="client_merchant" label="Client/Merchant" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="user" label="User" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="due_date" label="Due Date" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="company" label="Company" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="type_of_bill" label="Type of Bill" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="action" label="Action" order={order} orderBy={orderBy} onSort={handleSort} />
                                            </TableRow>
                                        </TableHead>

                                        <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">
                                                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                                                            <CircularProgress size={20} />
                                                            <Typography variant="body2">Loading…</Typography>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ) : pagedRows.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={10} align="center">
                                                        <Typography variant="body2" color="text.secondary" py={2}>
                                                            No products found.
                                                        </Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                pagedRows.map((row, index) => (
                                                    <TableRow key={row.product_id ?? row.id ?? row.sku}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{row.product_name}</TableCell>
                                                        <TableCell>{row.sku}</TableCell>
                                                        <TableCell>{row.description}</TableCell>
                                                        <TableCell>{row.unit}</TableCell>
                                                        <TableCell>{Number(row.stock ?? 0)}</TableCell>
                                                        <TableCell>{row.cost_price ? peso(row.cost_price) : ""}</TableCell>
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
            </Box>


            <PayableDialog
                open={openPayablesDialog}
                onClose={() => setOpenPayablesDialog(false)}
                warehouses={modalType === "Add" ? warehouseNames : warehouses}
                user={modalType === "Edit" ? selectedUser : null}
                onSubmit={(payload) => {
                    handleManagePayables(payload, modalType);
                    setOpenPayablesDialog(false);
                }}
                modal_type={modalType}
            />
        </Box>
    );
}

export default ManagePayables;
