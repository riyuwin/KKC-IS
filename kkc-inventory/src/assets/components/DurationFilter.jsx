import { TextField, Stack, Button } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function DurationFilter({
  duration,
  onDurationChange,
  sx,
  dataToExport,
  tab
}) {
  const handleExportExcel = () => {
    if (!dataToExport || !dataToExport.length) {
      alert("No data to export");
      return;
    }

    let exportData = [];
console.log("dataToExport:", dataToExport);

    if (tab === 1) {
      // 🛒 Sales Report
      exportData = dataToExport.map((row, index) => ({
        "No.": index + 1,
        "Date": new Date(row.Date).toLocaleDateString(),
        "Customer": row.Customer,
        "Product": row.Product,
        "Quantity Sold": row.Quantity_Sold,
        "Selling Price": row.Selling_Price,
        "Total": row.Total_Sale,
        "Payment Status": row.Payment_Status,
        "Delivery Status": row.Delivery_Status,
      }));
    } else if (tab === 2) {
      // 📦 Purchases Report
      exportData = dataToExport.map((row, index) => ({
        "No.": index + 1,
        "Date": new Date(row.purchase_date).toLocaleDateString(),
        "Supplier": row.supplier_name,
        "Product": row.product_name,
        "Purchased": row.quantity,
        "Received": row.qty_received,
        "Remaining": row.remaining,
        "Unit ₱": row.unit_cost,
        "Total ₱": row.total_cost,
        "Order Status": row.purchase_status,
        "Payment Status": row.purchase_payment_status,
      }));
    }

    // ✅ Create worksheet & workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      tab === 1 ? "Sales" : "Purchases"
    );

    // ✅ Export file
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, tab === 1 ? "sales_report.xlsx" : "purchases_report.xlsx");
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{ width: "100%", mt: 5, px: 1 }}
    >
      <TextField
        size="small"
        label="Start Date"
        type="date"
        value={duration.startDate || ""}
        onChange={(e) =>
          onDurationChange({ ...duration, startDate: e.target.value })
        }
        InputLabelProps={{ shrink: true }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: 2,
          },
          ...sx,
        }}
      />

      <TextField
        size="small"
        label="End Date"
        type="date"
        value={duration.endDate || ""}
        onChange={(e) =>
          onDurationChange({ ...duration, endDate: e.target.value })
        }
        InputLabelProps={{ shrink: true }}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: 2,
          },
          ...sx,
        }}
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
