import { PortRetrieveWarehouse } from '../../../api_ports/api';
import Swal from 'sweetalert2';

export default async function RetrieveWarehouse() {    
    try {
        const response = await fetch(PortRetrieveWarehouse);
        const data = await response.json();
        return { data }; 
    } catch (error) {
        console.error("Error fetching warehouse:", error);
    }
}
