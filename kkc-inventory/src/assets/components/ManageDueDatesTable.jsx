import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Stack, Tooltip, IconButton
} from "@mui/material";
import { MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import TablePager from "./TablePager";
import SearchBar from "./SearchBar";
import SortableHeader, { getComparator, stableSort } from "./SortableHeader";
import DueDatesDialog from "./DueDatesDialog";
import { CheckDueDatesRecord, UpdateDueDates } from "../logics/bills/ManageDueDates";
import Swal from "sweetalert2";

function ManageDueDatesTable({ stockStatus, setDataToExport }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchNow, setSearchNow] = useState("");
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("client_merchant");
    const [openDialog, setOpenDialog] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedBill, setSelectedBill] = useState(null);
    const [monthFilter, setMonthFilter] = useState("this_month");

    // === Fetch due dates on mount ===
    const fetchDueDates = async () => {
        setLoading(true);
        try {
            const { data } = await CheckDueDatesRecord();
            setRows(Array.isArray(data) ? data : []);
            if (setDataToExport) setDataToExport(data);
        } catch (err) {
            console.error("Error fetching due dates:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDueDates();
    }, []);

    // === Debounce search input ===
    useEffect(() => {
        const t = setTimeout(() => setSearchNow(search), 150);
        return () => clearTimeout(t);
    }, [search]);

    // === Filter rows based on search ===
    const filteredRows = useMemo(() => {
        return rows.filter(bill => {

            const billDate = new Date(bill.added_at);
            if (!bill.payment_date || isNaN(billDate)) return false;

            const today = new Date();
            const billMonth = billDate.getMonth();
            const billYear = billDate.getFullYear();

            // --- MONTH FILTER ---
            if (monthFilter === "this_month") {
                if (billMonth !== today.getMonth() || billYear !== today.getFullYear())
                    return false;
            } else if (monthFilter !== "all") {
                const selectedMonth = Number(monthFilter);
                if (billMonth !== selectedMonth) return false;
            }

            // --- SEARCH FILTER ---
            const matchesSearch =
                (bill.client_merchant || "").toLowerCase().includes(searchNow.toLowerCase()) ||
                (bill.company || "").toLowerCase().includes(searchNow.toLowerCase());

            return matchesSearch;
        });
    }, [rows, searchNow, monthFilter]);




    // === Sorting ===
    const sortedRows = useMemo(
        () => stableSort(filteredRows, getComparator(order, orderBy)),
        [filteredRows, order, orderBy]
    );
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    // === Dialog handler ===
    const handleDialogOpen = (type, bill = null) => {
        setModalType(type);
        setSelectedBill(bill);
        setOpenDialog(true);
        console.log(`Dialog opened: ${type}`, bill);
    };

    // === Update Handler (for edit mode) ===
    const handleUpdateDueDate = async (updatedBill) => {
        console.log("Submitted edit data:", updatedBill);
        await UpdateDueDates({
            due_date_id: updatedBill.due_date_id,
            payment_status: updatedBill.payment_status || null,
            payment_date: updatedBill.payment_date,
            payment_mode: updatedBill.payment_mode || null,
            total_bill_amount: updatedBill.total_bill_amount || null,
        });
        setOpenDialog(false);
        fetchDueDates();
    };

    const headerCellSx = {
        p: 1.5, fontSize: "0.95rem", fontWeight: 700,
        bgcolor: "#706f6fff", textAlign: "center", color: "white",
    };
    const bodyCellSx = { textAlign: "center", fontSize: "0.90rem", py: 2, px: 1 };

    return (
        <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Due Dates (This Year)
                </Typography>
            </Stack>

            <Stack direction="row" spacing={2} sx={{ my: 2 }}>
                <SearchBar search={search} onSearchChange={setSearch} />

                <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    style={{
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "0.9rem"
                    }}
                >
                    <option value="this_month">This Month</option>
                    <option value="all">All Months</option>
                    {Array.from({ length: 12 }).map((_, i) => (
                        <option key={i} value={i}>{new Date(0, i).toLocaleString("en-US", { month: "long" })}</option>
                    ))}
                </select>
            </Stack> 

            {/* <SearchBar search={search} onSearchChange={setSearch} /> */}

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
                                            <SortableHeader id="company" label="Company" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="type_of_bill" label="Type of Bill" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="payment_status" label="Payment Status" order={order} orderBy={orderBy} onSort={handleSort} />
                                            <SortableHeader id="payment_date" label="Payment Date" order={order} orderBy={orderBy} onSort={handleSort} />
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
                                                        No due dates found.
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pagedRows.map((row, index) => (
                                                <TableRow key={row.due_date_id || index}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{row.client_merchant}</TableCell>
                                                    <TableCell>{row.company}</TableCell>
                                                    <TableCell>{row.type_of_bill}</TableCell>
                                                    <TableCell>
                                                        <span
                                                            style={{
                                                                color:
                                                                    row.payment_status === "Paid"
                                                                        ? "green"
                                                                        : row.payment_status === "Pending"
                                                                            ? "orange"
                                                                            : row.payment_status === "Overdue"
                                                                                ? "red"
                                                                                : "gray",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {row.payment_status || "Unknown"}
                                                        </span>
                                                    </TableCell>

                                                    <TableCell>
                                                        {row.payment_date && !isNaN(new Date(row.payment_date))
                                                            ? new Date(row.payment_date).toLocaleDateString("en-US", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })
                                                            : "No Payment Yet"}
                                                    </TableCell>

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
                                                            {/* <Tooltip title="Delete">
                                                                <IconButton size="small" color="error" onClick={() => handleDialogOpen("Delete", row)}>
                                                                    <MdDelete style={{ fontSize: 22 }} />
                                                                </IconButton>
                                                            </Tooltip> */}
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

            {/* === Edit / View / Delete Dialog === */}
            <DueDatesDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSubmit={handleUpdateDueDate}
                modal_type={modalType}
                bill={selectedBill}
            />
        </Box>
    );
}

export default ManageDueDatesTable;
