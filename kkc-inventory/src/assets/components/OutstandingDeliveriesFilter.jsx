import { TextField, Stack, Button, MenuItem } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function OutstandingDeliveriesFilter({
    stockStatus,
    onStatusChange,
    sx,
    dataToExport,
    tab
}) {
    const handleExportExcel = async () => {
        console.log("📦 DATA TO EXPORT:", dataToExport);

        if (!dataToExport || !dataToExport.length) {
            alert("No data to export");
            return;
        }

        //console.log("Test: ", stockStatus);

        // 🔹 Title
        let titleText = "KKC Inventory System - Outstanding Deliveries Summary";
        if (stockStatus === "sales") titleText = "KKC Inventory System - Outstanding Deliveries Sales Summary";
        else if (stockStatus === "purchase") titleText = "KKC Inventory System - Outstanding Deliveries Purchase Summary";

        // 🔹 Prepare export data (fixed)
        const exportData = dataToExport.map((row, index) => {
            const deliveries = row.deliveries || row; // fallback for different structures

            return {
                "No.": index + 1,
                "Customer Name": row.customer_name || row.sales_customer_name || "N/A",
                "Product": row.product?.product_name || row.sales_product_name || "N/A",
                "Total Order": deliveries.total_delivery_quantity || deliveries.order_quantity || 0,
                "Total Delivered": deliveries.total_delivered || deliveries.qty_received || 0,
                "Remaining Deliveries":
                    (deliveries.total_delivery_quantity || deliveries.order_quantity || 0) -
                    (deliveries.total_delivered || deliveries.qty_received || 0),
                "Warehouse Name": row.warehouse?.warehouse_name || row.warehouse_name || "N/A",
                "Latest Delivery Date": deliveries.updated_at || deliveries.sales_date || "N/A",
                "Stock Status": row.stock_status || row.source || "N/A",
            };
        });

        // 🔹 Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Outstanding Deliveries Summary", {
            pageSetup: {
                paperSize: 9,
                orientation: "landscape",
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
            },
        });

        // 🔹 Title Row
        const totalColumns = Object.keys(exportData[0]).length;
        worksheet.mergeCells(1, 1, 1, totalColumns);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = titleText;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // 🔹 Header Row
        const headers = Object.keys(exportData[0]);
        const headerRow = worksheet.getRow(2);

        headers.forEach((header, i) => {
            const cell = headerRow.getCell(i + 1);
            cell.value = header;
            cell.font = { bold: true, size: 12 };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });

        // 🔹 Data Rows
        exportData.forEach((row, rowIndex) => {
            const newRow = worksheet.getRow(rowIndex + 3);
            Object.values(row).forEach((val, colIndex) => {
                const cell = newRow.getCell(colIndex + 1);
                cell.value = val;
                cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };
            });
        });

        // 🔹 Set column widths
        worksheet.columns = [
            { width: 6 },
            { width: 30 },
            { width: 25 },
            { width: 18 },
            { width: 18 },
            { width: 20 },
            { width: 22 },
            { width: 16 },
        ];

        // 🔹 Export Excel
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${titleText.replace(/\s+/g, "_")}.xlsx`);
    };

    return (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%", mt: 5, px: 1 }}>
            {/* Stock Status Filter */}
            <TextField
                select
                size="small"
                label="Outstanding Deliveries Source"
                value={stockStatus || ""}
                onChange={(e) => onStatusChange(e.target.value)}
                sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2 },
                    ...sx,
                }}
            >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="sales">Sales</MenuItem>
                <MenuItem value="purchase">Purchase</MenuItem>
            </TextField>

            {/* Export Button */}
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
                Export Inventory to Excel
            </Button>
        </Stack>
    );
}
