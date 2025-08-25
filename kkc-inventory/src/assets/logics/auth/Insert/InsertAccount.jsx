import { PortSignUp } from '../../../api_ports/api';
import Swal from 'sweetalert2';

export default async function InsertAccount(warehouse_id, fullname, username, email, password, role) {  
    
    try {
        const response = await fetch(PortSignUp, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ warehouse_id, fullname, username, email, password, role })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Signup creation failed.");
        }

        console.log("Warehouse insert successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Signup Creation',
            text: 'New account created Successfully!',
        }); 

         

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Signup Creation Failed',
            text: err.message,
        });
    }
}
