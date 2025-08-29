import { PortLogin } from '../../api_ports/api';
import Swal from 'sweetalert2';

export async function ValidateLogin(email, password, navigate) {
    try {
        const response = await fetch(PortLogin, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json(); 

        if (!response.ok) {
            throw new Error(data.error || "Login failed.");
        }

        console.log("Login successful!", data);  

        Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome back!',
        }); 

        localStorage.setItem("user", JSON.stringify(data)); 

        if (data.role === "Admin") {
            setTimeout(() => navigate('/'), 2000);  
        } else if (data.role === "Warehouse") { 
            setTimeout(() => navigate('/'), 2000); 
            // To Do
        } 

    } catch (err) {
        console.error("Error:", err.message); 
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: err.message,
        });
    }
}
