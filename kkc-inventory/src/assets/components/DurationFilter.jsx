import { TextField, Stack, Button } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);

  const optionsDate = { year: "numeric", month: "long", day: "2-digit" };
  const formattedDate = date.toLocaleDateString("en-US", optionsDate);

  const optionsTime = { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
  const formattedTime = date.toLocaleTimeString("en-US", optionsTime);

  return `${formattedDate} : ${formattedTime}`;
}

export default function DurationFilter({ duration, onDurationChange, sx, dataToExport, tab }) {
  const handleExportExcel = async () => {
    if (!dataToExport || !dataToExport.length) {
      alert("No data to export");
      return;
    }

    let exportData = [];

    console.log("dataToExport: ", dataToExport);

    if (tab === 1) { 
      exportData = dataToExport.map((row, index) => ({
        "No.": index + 1,
        "Date": formatDateTime(row.Date),
        "Customer": row.Customer,
        "Product": row.Product,
        "Quantity Sold": row.Quantity_Sold,
        "Selling Price": row.Selling_Price,
        "Total": row.Total,
        "Payment Status": row.Payment_Status,
        "Delivery Status": row.Delivery_Status,
      }));
    } else if (tab === 2) { 
      exportData = dataToExport.map((row, index) => ({
        "No.": index + 1,
        "Date": formatDateTime(row.purchase_date),
        "Supplier": row.supplier_name,
        "Product": row.product_name,
        "Purchased": row.quantity,
        "Received": row.qty_received,
        "Remaining": row.remaining,
        "Unit": row.unit_cost,
        "Total ₱": row.total_cost,
        "Order Status": row.purchase_status,
        "Payment Status": row.purchase_payment_status,
      }));
    }

    // Gumawa ng workbook + worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      tab === 1 ? "Sales Report" : "Purchases Report",
      {
        pageSetup: {
          paperSize: 9, // A4
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      }
    );

    // Row 1 Title
    worksheet.addRow([]);
    const header = Object.keys(exportData[0] || {});
    worksheet.addRow(header);

    // Header formatting
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, size: 12 };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Data rows
    exportData.forEach(row => {
      const newRow = worksheet.addRow(Object.values(row));
      newRow.eachCell(cell => {
        cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Fixed widths depende sa tab
    if (tab === 1) {
      worksheet.columns = [
        { header: "No.", key: "no", width: 5 },
        { header: "Date", key: "date", width: 25 },
        { header: "Customer", key: "customer", width: 25 },
        { header: "Product", key: "product", width: 30 },
        { header: "Quantity Sold", key: "qty_sold", width: 15 },
        { header: "Selling Price", key: "selling_price", width: 15 },
        { header: "Total", key: "total", width: 15 },
        { header: "Payment Status", key: "payment", width: 18 },
        { header: "Delivery Status", key: "delivery", width: 18 },
      ];
    } else if (tab === 2) {
      worksheet.columns = [
        { header: "No.", key: "no", width: 5 },
        { header: "Date", key: "date", width: 32 },
        { header: "Supplier", key: "supplier", width: 25 },
        { header: "Product", key: "product", width: 30 },
        { header: "Purchased", key: "purchased", width: 11 },
        { header: "Received", key: "received", width: 11 },
        { header: "Remaining", key: "remaining", width: 11 },
        { header: "Unit", key: "unit", width: 12 },
        { header: "Total ₱", key: "total", width: 12 },
        { header: "Order Status", key: "order_status", width: 16 },
        { header: "Payment Status", key: "payment_status", width: 16 },
      ];
    }

    // Title Row (Row 1)
    const totalColumns = worksheet.columns.length;
    worksheet.mergeCells(1, 1, 1, totalColumns);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = tab === 1 ? "KKC Inventory System - Sales Report" : "KKC Inventory System - Purchases Report";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    for (let col = 1; col <= totalColumns; col++) {
      worksheet.getCell(1, col).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }

    // Export file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      tab === 1 ? "KKC Inventory System - Sales Report.xlsx" : "KKC Inventory System - Purchase Report.xlsx"
    );
  };

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%", mt: 5, px: 1 }}>
      <TextField
        size="small"
        label="Start Date"
        type="date"
        value={duration.startDate || ""}
        onChange={(e) => onDurationChange({ ...duration, startDate: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={{ flex: 1, "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2 }, ...sx }}
      />
      <TextField
        size="small"
        label="End Date"
        type="date"
        value={duration.endDate || ""}
        onChange={(e) => onDurationChange({ ...duration, endDate: e.target.value })}
        InputLabelProps={{ shrink: true }}
        sx={{ flex: 1, "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2 }, ...sx }}
      />
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
        Export Report to Excel
      </Button>
    </Stack>
  );
}
