import { Stack, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function StockFilter({ stockStatus, onStatusChange, sx, dataToExport }) {
  const handleExportExcel = () => {
    if (!dataToExport || !dataToExport.length) {
      alert("No data to export");
      return;
    }
 
    const filteredData = stockStatus
      ? dataToExport.filter(row => {
          const status = (row._stockStatus?.label ?? row.stock_status)
            .toLowerCase()
            .replace(" ", "_");
          return status === stockStatus;
        })
      : dataToExport;

    if (!filteredData.length) {
      alert("No data to export for the selected stock status");
      return;
    }
 
    const exportData = filteredData.map((row, index) => ({
      "No.": index + 1,
      "Product Name": row.product_name,
      "SKU/Code": row.sku,
      "Description": row.description,
      "Unit": row.unit,
      "Current Stock": row.stock ?? 0,
      "Cost Price": row.cost_price ?? "",
      "Selling Price": row.selling_price ?? "",
      "Stock Status": row._stockStatus?.label ?? row.stock_status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "stock_report.xlsx");
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%", mt: 5, px: 1 }}>
      <FormControl size="small" sx={{ flex: 1, ...sx }}>
        <InputLabel>Stock Status</InputLabel>
        <Select
          value={stockStatus || ""}
          label="Stock Status"
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="in_stock">In Stock</MenuItem>
          <MenuItem value="low_stock">Low Stock</MenuItem>
          <MenuItem value="out_of_stock">Out of Stock</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        startIcon={<MdFileDownload />}
        onClick={handleExportExcel}
        sx={{
          bgcolor: "#E67600",
          "&:hover": { bgcolor: "#f99f3fff" },
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 2,
          whiteSpace: "nowrap",
        }}
      >
        Export Stock Report
      </Button>
    </Stack>
  );
}
