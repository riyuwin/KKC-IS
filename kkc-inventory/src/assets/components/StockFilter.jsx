import { Stack, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import ExcelJS from "exceljs";   // <-- gamit natin ito
import { saveAs } from "file-saver";

function formatDateTime(isoString) {
  const date = new Date(isoString);

  const optionsDate = { year: "numeric", month: "long", day: "2-digit" };
  const formattedDate = date.toLocaleDateString("en-US", optionsDate);

  const optionsTime = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
  const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

  return `${formattedDate} : ${formattedTime}`;
}

export default function StockFilter({ stockStatus, onStatusChange, sx, dataToExport, tab }) {
  const handleExportExcel = async () => {
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

    let exportData = [];

    if (tab === 0) {
      exportData = filteredData.map((row, index) => ({
        "No.": index + 1,
        "SKU/Code": row.sku,
        "Product Name": row.product_name,
        "Description": row.description,
        "Unit": row.unit,
        "Current Stock": row.stock ?? 0,
        "Cost Price": row.cost_price ?? "",
        "Selling Price": row.selling_price ?? "",
        "Stock Status": row._stockStatus?.label ?? row.stock_status,
      }));
    } else if (tab === 3) {
      exportData = filteredData.map((row, index) => ({
        "No.": index + 1,
        "Customer/Supplier Name": row.source === "sales" ? row.customer_name : row.supplier_name,
        "Product": row.source === "sales" ? row.product?.product_name : row.product_name,
        "Total Ordered": row.quantity,
        "Delivered": row.source === "sales" ? row.deliveries?.total_delivered : row.qty_received,
        "Remaining":
          row.source === "sales"
            ? row.deliveries?.total_delivery_quantity - row.deliveries?.total_delivered
            : row.remaining,
        "Datetime": row.source === "sales" ? formatDateTime(row.sales_date) : formatDateTime(row.purchase_date),
        "Source": row.source,
      }));
    }

    // Gumawa ng workbook at worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      tab === 0 ? "Stock Report" : "Outstanding Deliveries",
      {
        pageSetup: {
          paperSize: 9,         // A4
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0
        }
      }
    );

    // === Step 1: Placeholder Row 1 (Title) ===
    worksheet.addRow([]);

    // === Step 2: Header sa Row 2 ===
    const header = Object.keys(exportData[0] || {});
    worksheet.addRow(header);

    const headerRow = worksheet.getRow(2);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    });

    // === Step 3: Data Rows simula Row 3 ===
    exportData.forEach(row => {
      const newRow = worksheet.addRow(Object.values(row));
      newRow.eachCell(cell => {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" }
        };
      });
    });

    // === Step 4: Auto-fit columns ===
    /* worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 0;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength + 2;
    }); */

    if (tab === 0) { 
      worksheet.columns = [
        { header: "No.", key: "no", width: 5 },
        { header: "SKU/Code", key: "sku", width: 15 },
        { header: "Product Name", key: "product_name", width: 30 },
        { header: "Description", key: "description", width: 30 },
        { header: "Unit", key: "unit", width: 7 },
        { header: "Current Stock", key: "stock", width: 11 },
        { header: "Cost Price", key: "cost_price", width: 11 },
        { header: "Selling Price", key: "selling_price", width: 11 },
        { header: "Stock Status", key: "status", width: 15 }
      ];
    } else if (tab === 3) {
      worksheet.columns = [
        { header: "No.", key: "no", width: 5 },
        { header: "Customer/Supplier Name", key: "name", width: 26 },
        { header: "Product", key: "product", width: 30 },
        { header: "Total Ordered", key: "total_ordered", width: 15 },
        { header: "Delivered", key: "delivered", width: 12 },
        { header: "Remaining", key: "remaining", width: 12 },
        { header: "Datetime", key: "datetime", width: 32 },
        { header: "Source", key: "source", width: 11 }, 
      ];
    }


    // === Step 5: Title sa Row 1 at merge ayon sa total columns ===
    const totalColumns = worksheet.columns.length;
    worksheet.mergeCells(1, 1, 1, totalColumns);

    const titleCell = worksheet.getCell("A1");
    if (tab === 0) { 
      titleCell.value = "KKC Inventory System - Stock Report"; 
    } else if (tab === 3) {
      titleCell.value = "KKC Inventory System - Outstanding Deliveries";  
    }
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Apply border sa buong merged range (Row 1)
    for (let col = 1; col <= totalColumns; col++) {
      const cell = worksheet.getCell(1, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
      };
    }


    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      tab === 0 ? "Stock Report.xlsx" : "Outstanding Deliveries Report.xlsx"
    );
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
