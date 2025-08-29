import Swal from 'sweetalert2'; 
import { PortAccounts, PortSignUp } from '../../api_ports/api';

export async function InsertAccount(payload) {  

    console.log("ASFSFSAF", payload)
    try {
        const response = await fetch(PortSignUp, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Signup creation failed.");
        }

        console.log("Account insert successfully!", data);  

        Swal.fire({
            icon: "success",
            title: "Signup Creation",
            text: "New account created successfully!",
        });  

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: "error",
            title: "Signup Creation Failed",
            text: err.message,
        });
    }
}   

export async function UpdateAccount(payload) {  

    console.log("Accounts: ", payload);
    try {
        const response = await fetch(PortAccounts, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)    
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Update account failed.");
        }

        console.log("Update account successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Update Account',
            text: 'Account Updated Successfully!',
        });  

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Account updates Failed',
            text: err.message,
        });
    }
}   


export async function DeleteAccount(account_id) {    
    try { 
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This action will permanently delete the account.",
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
 
        const response = await fetch(PortAccounts, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account_id })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Account deletion failed.");
        }

        console.log("Account deleted successfully!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: 'Account has been deleted successfully.',
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

export async function RetrieveAccounts() {    
    try {
        const response = await fetch(PortAccounts);
        const data = await response.json();
        return { data }; 
    } catch (error) {
        console.error("Error fetching warehouse:", error);
    }
}
 
 

