import { PortDeleteWarehouse } from '../../../api_ports/api';
import Swal from 'sweetalert2';

export default async function DeleteWarehouse(warehouseId) {    
    try {
        // Confirmation dialog
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action will permanently delete the warehouse.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) {
            return; 
        }

        // Proceed with deletion
        const response = await fetch(PortDeleteWarehouse, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ warehouseId })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Warehouse deletion failed.");
        }

        console.log("Warehouse deleted successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Warehouse has been deleted successfully.',
        });

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Deletion Failed',
            text: err.message,
        });
    }
}
