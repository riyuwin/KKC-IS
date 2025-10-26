import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Stack, Button,
    Tooltip, IconButton
} from "@mui/material";
import { MdAdd, MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import PayableDialog from "./PayableDialog";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import { DeleteBills, InsertBills, RetrieveBills, UpdatePayables } from "../logics/bills/ManageBills";
import TablePager from "../components/TablePager";
import SearchBar from "../components/SearchBar";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";

function ManagePayables({ setDataToExport }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchNow, setSearchNow] = useState("");
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("client_merchant");
    const [openPayablesDialog, setOpenPayablesDialog] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    // Convert warehouse list to dropdown options
    const warehouseNames = useMemo(
        () => warehouses.map((w) => ({ label: w.warehouse_name, value: w.warehouse_id })),
        [warehouses]
    );

    // Unified dialog handler for Add / Edit / View / Delete
    const handleDialogOpen = (type, bill = null) => {
        setModalType(type);
        setSelectedBill(bill);
        setOpenPayablesDialog(true);
        console.log(`Dialog opened: ${type}`, bill);
    };

    // Fetch warehouses
    useEffect(() => {
        const fetchWarehouses = async () => {
            const { data } = await RetrieveWarehouse();
            setWarehouses(data);
        };
        fetchWarehouses();
    }, []);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setSearchNow(search), 150);
        return () => clearTimeout(t);
    }, [search]);

    // Load bills
    const loadBills = async () => {
        setLoading(true);
        try {
            const { data } = await RetrieveBills();
            const result = Array.isArray(data) ? data : [];

            // Filter by search
            const filtered = result.filter(bill =>
                bill.client_merchant?.toLowerCase().includes(searchNow.toLowerCase()) ||
                bill.company?.toLowerCase().includes(searchNow.toLowerCase())
            );

            setRows(filtered);
            if (setDataToExport) setDataToExport(filtered);
        } catch (err) {
            console.error("Error loading bills:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBills(); }, [searchNow]);

    // Sorting
    const sortedRows = useMemo(
        () => stableSort(rows, getComparator(order, orderBy)),
        [rows, order, orderBy]
    );

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    // Add / Edit handler
    const handleManagePayables = async (payload, modal_type) => {
        try {
            console.log("Submitted payload:", payload);
            console.log("Modal type:", modal_type);

            if (modal_type === "Add") {
                await InsertBills(payload);
            } else if (modal_type === "Edit") {
                await UpdatePayables(payload);
            }

            await loadBills();
        } catch (err) {
            console.error(`Error in ${modal_type}:`, err);
        }
    };

    const headerCellSx = {
        p: 1.5, fontSize: "0.95rem", fontWeight: 700,
        bgcolor: "#706f6fff", textAlign: "center", color: "white",
    };
    const bodyCellSx = { textAlign: "center", fontSize: "0.90rem", py: 2, px: 1 };

    const handleDeleteBill = async (payables_id) => {
        console.log("TEST: " + payables_id);
        await DeleteBills(payables_id);
        await loadBills();  
    };

    return (
        <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Manage Payables
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<MdAdd />}
                    sx={{
                        bgcolor: "#E67600",
                        "&:hover": { bgcolor: "#f99f3fff" },
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2
                    }}
                    onClick={() => handleDialogOpen("Add")}
                >
                    Add Payables
                </Button>
            </Stack>

            <SearchBar search={search} onSearchChange={setSearch} />

            <Paper elevation={1} sx={{ mt: 3, borderRadius: 2 }}>
                <TableContainer>
                    <TablePager data={sortedRows} resetOn={`${order}-${orderBy}-${searchNow}`} initialRowsPerPage={10}>
                        {({ pagedRows, Pagination }) => (
                            <>
                                <Table size="small">
                                    <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                                        <TableRow>
                                            <SortableHeader id="no" label="No." order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="client_merchant" label="Client/Merchant" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="user" label="User" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="due_date" label="Due Date (Day in Month)" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="company" label="Company" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="type_of_bill" label="Type of Bill" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="bill_status" label="Bill Status" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="action" label="Action" order={order} orderBy={orderBy} onSort={handleSort} />
                                        </TableRow>
                                    </TableHead>

                                    <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                                                        <CircularProgress size={20} />
                                                        <Typography variant="body2">Loading…</Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ) : pagedRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} align="center">
                                                    <Typography variant="body2" color="text.secondary" py={2}>
                                                        No bills found.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pagedRows.map((row, index) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{row.client_merchant}</TableCell>
                                                    <TableCell>{row.user}</TableCell>
                                                    <TableCell>{row.due_date}</TableCell>
                                                    <TableCell>{row.company}</TableCell>
                                                    <TableCell>{row.type_of_bill}</TableCell>
                                                    <TableCell>{row.bill_status}</TableCell>
                                                    <TableCell>
                                                        <Stack direction="row" justifyContent="center" spacing={0.5}>
                                                            <Tooltip title="View">
                                                                <IconButton size="small" color="success" onClick={() => handleDialogOpen("View", row)}>
                                                                    <MdVisibility style={{ fontSize: 22 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Edit">
                                                                <IconButton size="small" color="primary" onClick={() => handleDialogOpen("Edit", row)}>
                                                                    <MdEdit style={{ fontSize: 22 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Delete">
                                                                <IconButton size="small" color="error" onClick={() => handleDeleteBill(row.payables_id)}>
                                                                    <MdDelete style={{ fontSize: 22 }} />
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

            <PayableDialog
                open={openPayablesDialog}
                onClose={() => setOpenPayablesDialog(false)}
                warehouses={warehouseNames}
                onSubmit={handleManagePayables}
                modal_type={modalType}
                bill={selectedBill}
            />
        </Box>
    );
}

export default ManagePayables;
