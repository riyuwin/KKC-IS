import { PortInsertWarehouse } from '../../api_ports/api';
import Swal from 'sweetalert2';

export default async function InsertWarehouse(warehouseName, warehouseLocation) {    
    try {
        const response = await fetch(PortInsertWarehouse, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ warehouseName, warehouseLocation })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Warehouse insertion failed.");
        }

        console.log("Warehouse insert successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Warehouse Insertion',
            text: 'Warehouse insert Successfully!',
        }); 

         

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Warehouse Insertion Failed',
            text: err.message,
        });
    }
}
