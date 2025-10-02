import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, CircularProgress, Stack, Chip
} from "@mui/material";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import TablePager from "../components/TablePager";
import SearchBar from "../components/SearchBar";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";

function peso(n) {
    if (n === "" || n === null || typeof n === "undefined") return "";
    const num = Number(n);
    if (Number.isNaN(num)) return n;
    return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}

function ProductReportTable({ stockStatus = "", setDataToExport }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [searchNow, setSearchNow] = useState("");
    const [order, setOrder] = useState("asc");
    const [orderBy, setOrderBy] = useState("product_name");

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
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 5, mt: 0 }}>
                        Inventory Summary
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <SearchBar search={search} onSearchChange={setSearch} placeholder="Search products..." />
                    </Stack>
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
                                                <SortableHeader id="product_name" label="Product Name" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="sku" label="SKU/Code" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="description" label="Description" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="unit" label="Unit" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="stock" label="Current Stock" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="cost_price" label="Cost Price" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="selling_price" label="Selling Price" order={order} orderBy={orderBy} onSort={handleSort} />
                                                <SortableHeader id="_stockStatus.label" label="Stock Status" order={order} orderBy={orderBy} onSort={handleSort} />
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
                                                        <TableCell>{row.selling_price ? peso(row.selling_price) : ""}</TableCell>
                                                        <TableCell>
                                                            <Chip size="small" label={row._stockStatus.label} color={row._stockStatus.color} />
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
            </Box>
        </Box>
    );
}

export default ProductReportTable;
