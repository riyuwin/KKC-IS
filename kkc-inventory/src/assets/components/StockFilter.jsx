import { TextField, Stack, Button, MenuItem } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function StockFilter({ stockStatus, onStatusChange, sx, dataToExport, tab }) {
    const handleExportExcel = async () => {
        if (!dataToExport || !dataToExport.length) {
            alert("No data to export");
            return;
        }

        // 🔹 Determine title based on selected stock status
        let titleText = "KKC Inventory System - Inventory Summary";
        if (stockStatus === "in_stock") titleText = "KKC Inventory System - In Stock Summary";
        else if (stockStatus === "low_stock") titleText = "KKC Inventory System - Low Stock Summary";
        else if (stockStatus === "out_of_stock") titleText = "KKC Inventory System - Out of Stock Summary";

        // 🔹 Prepare export data
        const exportData = dataToExport.map((row, index) => ({
            "No.": index + 1,
            "Product Name": row.product_name || row.Product || "N/A",
            "Category": row.category_name || row.Category || "N/A",
            "Stock Quantity": row.quantity || row.Stock_Quantity || 0,
            "Reorder Level": row.reorder_level || row.Reorder_Level || 0,
            "Unit Cost": row.unit_cost || row.Unit_Cost || 0,
            "Total Value": row.total_value || (row.quantity * row.unit_cost) || 0,
            "Status": row.stock_status || row.Status || "N/A",
        }));

        // 🔹 Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Inventory Summary", {
            pageSetup: {
                paperSize: 9, // A4
                orientation: "landscape",
                fitToPage: true,
                fitToWidth: 1,
                fitToHeight: 0,
            },
        });

        // 🔹 Title Row (Row 1)
        const totalColumns = 8;
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

        // 🔹 Header Row (Row 2)
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

        // 🔹 Data Rows (start Row 3)
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
            { width: 15 },
            { width: 18 },
            { width: 18 },
        ];

        // 🔹 Export Excel file
        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `${titleText.replace(/\s+/g, "_")}.xlsx`);
    };

    return (
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: "100%", mt: 5, px: 1 }}>
            {/* Stock Status Filter */}
            <TextField
                select
                size="small"
                label="Stock Status"
                value={stockStatus || ""}
                onChange={(e) => onStatusChange(e.target.value)}
                sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": { bgcolor: "background.paper", borderRadius: 2 },
                    ...sx,
                }}
            >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="low_stock">Low Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
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
