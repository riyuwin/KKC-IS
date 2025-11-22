import * as React from 'react';         
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';               
import { PortDashboard } from '../api_ports/api';

const API = PortDashboard;            

const fetchJSON = async (url) => {    
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(url);    
  return r.json();                    
};                                    

export default function WarehouseSelector({ 
  value,                                    
  onChange,                                 
  label = 'Warehouse',                      
  sx                                        
}) {                                        
  const [warehouses, setWarehouses] = React.useState([]);

  React.useEffect(() => {                   
    const loadWarehouses = async () => {    
      try {                                 
        const ws = await fetchJSON(`${API}/dashboard/warehouses`);
        setWarehouses(ws || []);            
      } catch (err) {                       
        console.error('Failed to load warehouses', err); 
      }                                      
    };                                       
    loadWarehouses();                        
  }, []);                                    

  // Warehouse user (only one warehouse) → no dropdown 
  if (!warehouses || warehouses.length <= 1) { 
    return null;                              
  }                                           

  return (                                    
    <FormControl                              
      size="small"                            
      sx={{                                   
        minWidth: 280,                        
        backgroundColor: '#ffffff',           // white dropdown  
        borderRadius: 1,                   
        boxShadow: 1,                         // subtle lift     
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(0,0,0,0.12)'     
        },
        ...sx                                 // allow overrides 
      }}
    >
      <InputLabel id="warehouse-select-label">{label}</InputLabel>
      <Select
        labelId="warehouse-select-label"
        label={label}
        value={value}
        onChange={onChange}
      >
        <MenuItem value="">
          <em>All Warehouses</em>
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
