import { TextField, InputAdornment, Stack, Button } from "@mui/material";
import { MdFileDownload } from "react-icons/md";

export default function DurationFilter({
  duration,
  onDurationChange,
  sx,
}) {
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
