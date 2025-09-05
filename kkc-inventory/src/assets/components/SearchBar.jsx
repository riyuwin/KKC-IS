import { Stack, TextField, MenuItem, InputAdornment } from "@mui/material";
import { MdSearch } from "react-icons/md";

export default function SearchBar({
  search,
  onSearchChange, 
}) {
  return (  
    <TextField
        size="small"
        placeholder="Search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
        startAdornment: (
            <InputAdornment position="start">
            <MdSearch />
            </InputAdornment>
        ),
        }}
        sx={{
        width: 450,
        "& .MuiOutlinedInput-root": {
            bgcolor: "background.paper",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,0,0,0.25)",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(0,0,0,0.45)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#E67600",
            borderWidth: 2,
            },
        },
        "& input::placeholder": { opacity: 1 },
        }}
    />
  );
}
