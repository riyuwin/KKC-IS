import Swal from "sweetalert2";
import { PortDueDates } from "../../api_ports/api";

export async function CheckDueDatesRecord(showAlert = false) {
    try {
        const response = await fetch(PortDueDates);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (showAlert) {
            Swal.fire({
                icon: "success",
                title: "Due Dates Checked",
                text: "Records for the current month are up-to-date.",
                timer: 2000,
                showConfirmButton: false,
            });
        }

        return { data };
    } catch (error) {
        console.error("Error fetching due dates:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to check due dates. Please try again.",
        });
    }
}

/* export async function UpdateDueDates(payload) {
    try {
        if (!payload.due_date_id) throw new Error("Missing due_date_id for update"); 

        const response = await fetch(`${PortDueDates}/${payload.due_date_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" }, 
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Update due date failed.");
        }

        console.log("Due date updated successfully!", data);

        Swal.fire({
            icon: 'success',
            title: 'Due Date Updated',
            text: 'The due date has been successfully updated!',
        });

    } catch (err) {
        console.error("Error:", err.message);
        Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err.message,
        });
    }
} */

export async function UpdateDueDates(payload) {
  try {
    console.log("Submitting payload to backend:", payload);

    if (!payload.due_date_id) throw new Error("Missing due_date_id for update");
 
    let formattedDate = null;
    if (payload.payment_date && payload.payment_date !== "0000-00-00") {
      const dateObj = new Date(payload.payment_date);
      if (!isNaN(dateObj)) {
        formattedDate = dateObj.toISOString().split("T")[0];
      }
    }

    const response = await fetch(`${PortDueDates}/${payload.due_date_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payment_status: payload.payment_status || null,
        payment_date: formattedDate,  
        payment_mode: payload.payment_mode || null,
        total_bill_amount: payload.total_bill_amount || null,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || "Update due date failed.");

    console.log("✅ Update successful:", data);
    Swal.fire({ icon: "success", title: "Updated!", text: "Due date updated successfully!" });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    Swal.fire({ icon: "error", title: "Update Failed", text: err.message });
  }
}

