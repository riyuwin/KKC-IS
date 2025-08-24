import React from "react";
import { TableCell, TableSortLabel } from "@mui/material";
import { FaSort } from "react-icons/fa";


const getPath = (obj, path) => {
  if (!obj || !path) return undefined;
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
};

// Normalize for compare
const normalizeVal = (val) => (Array.isArray(val) ? val.join(", ") : val ?? "");

// ASC compare: numeric if both numeric, else case-insensitive text
function compareAscBy(orderBy, a, b) {
  const avRaw = normalizeVal(getPath(a, orderBy));
  const bvRaw = normalizeVal(getPath(b, orderBy));

  const avNum =
    typeof avRaw === "number"
      ? avRaw
      : typeof avRaw === "string" && avRaw.trim() !== "" && !isNaN(avRaw)
      ? Number(avRaw)
      : null;

  const bvNum =
    typeof bvRaw === "number"
      ? bvRaw
      : typeof bvRaw === "string" && bvRaw.trim() !== "" && !isNaN(bvRaw)
      ? Number(bvRaw)
      : null;

  if (avNum !== null && bvNum !== null) {
    if (avNum < bvNum) return -1;
    if (avNum > bvNum) return 1;
    return 0;
  }

  const as = String(avRaw);
  const bs = String(bvRaw);
  return as.localeCompare(bs, undefined, { numeric: true, sensitivity: "base" });
}

function descendingComparator(a, b, orderBy) {
  // define asc then flip to keep stability consistent
  return -compareAscBy(orderBy, a, b);
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

// Sortable header cell (single always-visible FaSort + centered)
export default function SortableHeader({
  id,
  label,
  order,
  orderBy,
  onSort,
  align = "center",
  cellSx,
}) {
  const active = orderBy === id;

  return (
    <TableCell align={align} sx={{ fontWeight: 700, textAlign: align, ...cellSx }}>
      <TableSortLabel
        active={active}
        direction={active ? order : "asc"}
        onClick={() => onSort(id)}
        IconComponent={() => null} // Completely remove MUI's default arrow:
        hideSortIcon
        sx={{
          display: "flex",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          color: "inherit",
          "&:hover": { color: "inherit" },
          "&.Mui-active": { color: "inherit" },
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
          <span>{label}</span>
          <FaSort style={{ verticalAlign: "middle" }} />
        </span>
      </TableSortLabel>
    </TableCell>
  );
}
