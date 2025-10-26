import { TextField, Stack, Button, MenuItem } from "@mui/material";
import { MdFileDownload } from "react-icons/md";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export default function DueDatesFilter({ stockStatus, onStatusChange, sx, dataToExport, tab }) {

    console.log(dataToExport);
    const handleExportExcel = async () => {
        if (!dataToExport || !dataToExport.length) {
            alert("No data available.");
            return;
        }

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
 
        const filteredData = dataToExport.filter((row) => {
            return row.year?.toString() === stockStatus;
        });

        if (!filteredData.length) {
            alert(`No records found for year ${stockStatus}`);
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Payables Summary", {
            pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
        });
 
        const totalColumns = 4 + months.length;
        worksheet.mergeCells(1, 1, 1, totalColumns);
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `KKC Payables Summary - ${stockStatus}`;
        titleCell.font = { bold: true, size: 16 };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
 
        const headers = ["No.", "Client", "Company", "Type of Bill", ...months];
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
 
        filteredData.forEach((row, index) => {
            const newRow = worksheet.getRow(index + 3);
 
            let monthIndex = -1;
            if (typeof row.month === "string") {
                const monthName = row.month.trim().toLowerCase();
                monthIndex = months.findIndex(
                    (m) => m.toLowerCase().startsWith(monthName.substring(0, 3))
                );
            } else if (typeof row.month === "number") {
                monthIndex = row.month - 1;
            }

            const monthData = Array(12).fill("");
            if (monthIndex >= 0 && monthIndex < 12) {
                monthData[monthIndex] =
                    row.total_bill_amount
                        ? `₱${parseFloat(row.total_bill_amount).toLocaleString()}`
                        : row.bill_status === "Paid"
                            ? "Paid"
                            : "";
            }

            const rowData = [
                index + 1,
                row.client_merchant || "N/A",
                row.company || "N/A",
                row.type_of_bill || "N/A",
                ...monthData,
            ];

            rowData.forEach((val, colIndex) => {
                const cell = newRow.getCell(colIndex + 1);
                cell.value = val;
                cell.alignment = { horizontal: "center", vertical: "middle" };
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" },
                };

                if (val === "Paid") {
                    cell.font = { color: { argb: "FF2E7D32" }, bold: true }; // green
                } else if (val === "") {
                    cell.font = { color: { argb: "FFB71C1C" } }; // red if empty
                }
            });
        });

        worksheet.columns = [
            { width: 6 },
            { width: 25 },
            { width: 25 },
            { width: 25 },
            ...months.map(() => ({ width: 15 })),
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer]),
            `KKC_Payables_Summary_${stockStatus || "All"}.xlsx`
        );
    };


    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ width: "100%", mt: 5, px: 1 }}
        >
            {/* Year Selector */}
            <TextField
                select
                size="small"
                label="Year to Export"
                value={stockStatus || ""}
                onChange={(e) => onStatusChange(e.target.value)}
                sx={{
                    flex: 1,
                    "& .MuiOutlinedInput-root": {
                        bgcolor: "background.paper",
                        borderRadius: 2,
                    },
                    ...sx,
                }}
            >
                {["2025", "2026", "2027", "2028", "2029", "2030", "2031", "2032"].map(
                    (year) => (
                        <MenuItem key={year} value={year}>
                            {year}
                        </MenuItem>
                    )
                )}
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
                Export Payables to Excel
            </Button>
        </Stack>
    );
}
