import Swal from 'sweetalert2'; 
import { PortBills} from '../../api_ports/api';

export async function InsertBills(payload) {  
 
    try {
        const response = await fetch(PortBills, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Bills insertion failed.");
        }

        console.log("Bill insert successfully!", data);  

        Swal.fire({
            icon: "success",
            title: "Bill Inserted",
            text: "Bill inserted successfully!",
        });  

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: "error",
            title: "Bill Insertion Failed",
            text: err.message,
        });
    }
}    