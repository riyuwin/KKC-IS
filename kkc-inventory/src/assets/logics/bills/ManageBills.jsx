import Swal from 'sweetalert2'; 
import { PortBills} from '../../api_ports/api';

export async function InsertBills(payload) {  

    console.log("TEST " + payload);
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

export async function RetrieveBills() {    
    try {
        const response = await fetch(PortBills);
        const data = await response.json();
        return { data }; 
    } catch (error) {
        console.error("Error fetching bills:", error);
    }
}


export async function UpdatePayables(payload) {  
    try {
        console.log("TEST " + payload);
        if (!payload.payables_id) throw new Error("Missing bill ID for update");

        const response = await fetch(`${PortBills}/${payload.payables_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)    
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || data.message || "Update bills failed.");
        }

        console.log("Update bills successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Update Payables',
            text: 'Account Payables Successfully Updated!',
        });  

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Payables Update Failed',
            text: err.message,
        });
    }
}   
