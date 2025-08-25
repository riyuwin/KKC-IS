import { PortRetrieveAccounts } from '../../../api_ports/api';
import Swal from 'sweetalert2';

export default async function RetrieveAccounts() {    
    try {
        const response = await fetch(PortRetrieveAccounts);
        const data = await response.json();
        return { data }; 
    } catch (error) {
        console.error("Error fetching warehouse:", error);
    }
}
