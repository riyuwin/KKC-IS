import Swal from 'sweetalert2';
import { PortSales } from '../../api_ports/api';

export async function InsertSales(payload) {    
    try {
        const response = await fetch(PortSales, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Sales insertion failed.");
        }

        console.log("Sales insert successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Sales Insertion',
            text: 'Sales insert Successfully!',
        });  

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Sales Insertion Failed',
            text: err.message,
        });
    }
} 