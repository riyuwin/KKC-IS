import Swal from 'sweetalert2';
import { PortWarehouse } from '../../api_ports/api';

export async function InsertWarehouse(payload) {    
    try {
        const response = await fetch(PortWarehouse, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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

export async function UpdateWarehouse(payload) {    
    try {
        const response = await fetch(PortWarehouse, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
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
 
export async function DeleteWarehouse(warehouseId) {    
    try { 
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
 
        const response = await fetch(PortWarehouse, {
            method: "DELETE",
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
 
export async function RetrieveWarehouse() {    
    try {
        const response = await fetch(PortWarehouse, {
            method: 'GET'
        });
        const data = await response.json();
        return { data }; 
    } catch (error) {
        console.error("Error fetching warehouse:", error);
    }
}
