import React from "react";
import { TableCell, TableSortLabel } from "@mui/material";

// Sort Helpers
const sortVal = (row, key) =>
    Array.isArray(row?.[key]) ? row[key].join(", ") : row?.[key] ?? "";

function descendingComparator(a, b, orderBy) {
    const av = sortVal(a, orderBy);
    const bv = sortVal(b, orderBy);
    if (bv < av) return -1;
    if (bv > av) return 1;
    return 0;
}

export function getComparator(order, orderBy) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
    const stabilized = array.map((el, index) => [el, index]);
    stabilized.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilized.map((el) => el[0]);
}

// Reusable Sortable Header
export default function SortableHeader({
    id,
    label,
    order,
    orderBy,
    onSort,
    align = "center",
}) {
    const active = orderBy === id;

    return (
        <TableCell sx={{ fontWeight: 700, textAlign: align }}>
            <TableSortLabel
                active={active}
                direction={active ? order : "asc"}
                onClick={() => onSort(id)}
                hideSortIcon={false}
            >
                {label}
            </TableSortLabel>
        </TableCell>
    );
}
