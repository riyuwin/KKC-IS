import Swal from 'sweetalert2';
import { PortSales } from '../../api_ports/api';
export async function InsertSales(payload) {
    try {
        const formData = new FormData();

        // Append all fields except attachments
        for (const key in payload) {
            if (key !== "attachments") {
                formData.append(key, payload[key]);
            }
        }

        // Append attachments separately
        if (payload.attachments && payload.attachments.length > 0) {
            payload.attachments.forEach(file => {
                formData.append("attachments", file);
            });
        }

        const response = await fetch(PortSales, {
            method: "POST",
            body: formData, // no JSON.stringify, no Content-Type
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
  
export async function RetrieveSales() {    
    try {
        const response = await fetch(PortSales, {
            method: 'GET'
        });
        const data = await response.json();
        return { data }; 
    } catch (error) {
        console.error("Error fetching sales:", error);
    }
}
