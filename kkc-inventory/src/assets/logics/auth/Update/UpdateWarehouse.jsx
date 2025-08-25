import { PortUpdateWarehouse } from '../../../api_ports/api';
import Swal from 'sweetalert2';

export default async function UpdateWarehouse(warehouseId, warehouseName, warehouseLocation) {    
    try {
        const response = await fetch(PortUpdateWarehouse, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ warehouseId, warehouseName, warehouseLocation })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Warehouse update failed.");
        }

        console.log("Warehouse insert successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Warehouse Updated',
            text: 'Warehouse updated Successfully!',
        }); 

         

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Warehouse Update Failed',
            text: err.message,
        });
    }
}
