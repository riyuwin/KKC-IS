import * as React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { PortDashboard } from "../api_ports/api";

const API = PortDashboard;

const fetchJSON = async (url) => {
  const r = await fetch(url, { credentials: "include" });
  if (!r.ok) throw new Error(url);
  return r.json();
};

export default function AdminWarehouseSelector({
  value,
  onChange,
  label = "Warehouse",
  sx,
  allLabel = "All Warehouses",
  allValue = "", 
}) {
  const [warehouses, setWarehouses] = React.useState([]);

  React.useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const ws = await fetchJSON(`${API}/dashboard/warehouses`);
        setWarehouses(Array.isArray(ws) ? ws : []);
      } catch (err) {
        console.error("Failed to load warehouses", err);
        setWarehouses([]);
      }
    };
    loadWarehouses();
  }, []);

  if (!warehouses || warehouses.length <= 1) return null;

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 280,
        backgroundColor: "#ffffff",
        borderRadius: 2,
        boxShadow: 3,
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(0,0,0,0.18)",
        },
        ...sx,
      }}
    >
      <InputLabel id="warehouse-select-label">{label}</InputLabel>
      <Select
        labelId="warehouse-select-label"
        label={label}
        value={value}
        onChange={onChange}
      >
        <MenuItem value={allValue}>
          <em>{allLabel}</em>
        </MenuItem>

        {warehouses.map((w) => (
          <MenuItem key={w.warehouse_id} value={String(w.warehouse_id)}>
            {w.warehouse_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
