import { PortLogin, PortLogout, PortSession } from '../../api_ports/api';
import Swal from 'sweetalert2';

export async function ValidateLogin(email, password, navigate) {
    try {
        const response = await fetch(PortLogin, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include",  
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
export async function ValidateUserLoggedIn(navigate) {
    try {
        const response = await fetch(PortSession, {
            method: "GET",
            credentials: "include", // keep cookies/session
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login failed.");
        }

        if (!data.loggedIn || !data.user) {
            throw new Error("No active session found.");
        }

        console.log("Session active:", data); 
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user.role;
        if (role === "Admin") { 
            // To Do
        } else if (role === "Warehouse") {
            // To Do 
        } else {
            navigate("/login");
            return null;
        }
 
        return data.user;

    } catch (err) {
        console.error("Error:", err.message);
        navigate("/login");
        return null;  
    }
}


export async function Logout() {
    try {
        const response = await fetch(PortLogout, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Logout failed.");
        }

        console.log("Logout successful!", data);
 
        localStorage.removeItem("user");

        Swal.fire({
            icon: "success",
            title: "Logout Successful",
            text: "You have been logged out.",
        });

    } catch (err) {
        console.error("Error:", err.message);
        Swal.fire({
            icon: "error",
            title: "Logout Failed",
            text: err.message,
        });
    }
}
