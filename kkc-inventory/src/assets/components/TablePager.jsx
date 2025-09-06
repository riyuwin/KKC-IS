import React, { useEffect, useMemo, useState, useCallback } from "react";
import { TablePagination } from "@mui/material";


export default function TablePager({
  data,
  initialRowsPerPage = 5,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  resetOn,
  align = "left",
  children,
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  useEffect(() => {
    setPage(0);
  }, [resetOn, data?.length]);


  const pagedRows = useMemo(() => {
    const safe = Array.isArray(data) ? data : [];
    const start = page * rowsPerPage;
    return safe.slice(start, start + rowsPerPage);
  }, [data, page, rowsPerPage]);


  const justify =
    align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";

  // Pagination component ng MaterialUI
  const Pagination = useCallback(
    (props) => (
      <TablePagination
        component="div"
        count={Array.isArray(data) ? data.length : 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Rows per page:"
        sx={{
          "& .MuiTablePagination-toolbar": { justifyContent: justify, gap: 2, pl: 3, pr: 0 },
          "& .MuiTablePagination-spacer": { flex: "0 0 0", display: "none" },
          "& .MuiTablePagination-displayedRows": { ml: 0, mr: 0 },
          ...props?.sx,
        }}
      />
    ),
    [data, page, rowsPerPage, rowsPerPageOptions, justify]
  );

  return children({ pagedRows, Pagination, page, rowsPerPage });
}
