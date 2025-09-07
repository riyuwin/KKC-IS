import Swal from "sweetalert2";
import { PortDocuments } from "../../api_ports/api";

const swalBase = (opts) =>
    Swal.fire({
        heightAuto: false,
        ...opts,
        didOpen: () => {
            const c = Swal.getContainer?.();
            if (c) c.style.zIndex = "20000";
        },
    });

const headersJSON = { Accept: "application/json" };

export async function fetchDocuments(search = "") {
    try {
        const url = new URL(PortDocuments);
        if (search) url.searchParams.set("search", search);
        const res = await fetch(url.toString(), { method: "GET", headers: headersJSON });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch documents");
        return data;
    } catch (err) {
        await swalBase({ icon: "error", title: "Load Failed", text: err.message });
        return [];
    }
}

export async function createDocument({ document_name, file }) {
    if (!file) {
        await swalBase({ icon: "warning", title: "No file selected" });
        return { cancelled: true };
    }

    const confirm = await swalBase({
        icon: "question",
        title: "Upload attachment?",
        text: "This will add a new document.",
        showCancelButton: true,
        confirmButtonText: "Upload",
        cancelButtonText: "Cancel",
        reverseButtons: false,
        focusCancel: true,
    });
    if (!confirm.isConfirmed) return { cancelled: true };

    const fd = new FormData();
    if (document_name) fd.append("document_name", document_name);
    fd.append("file", file);

    const res = await fetch(PortDocuments, { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
        await swalBase({ icon: "error", title: "Upload Failed", text: data.error || "Upload failed" });
        throw new Error(data.error || "Upload failed");
    }

    await swalBase({
        icon: "success",
        title: "Uploaded",
        text: "Document added successfully.",
        timer: 1400,
        showConfirmButton: false,
    });

    return data;
}

export async function fetchDocumentInline(id) {
    const res = await fetch(`${PortDocuments}/${id}/inline`, { method: "GET" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load file");
    return data; // { document_name, file_name, file_type, base64 }
}


export async function renameWithDialog(doc) {
    const { value: newName, isConfirmed } = await Swal.fire({
        title: "Rename document",
        input: "text",
        inputLabel: "New name",
        inputValue: doc.document_name || "",
        inputAttributes: { autocapitalize: "off" },
        showCancelButton: true,
        confirmButtonText: "Save",
        cancelButtonText: "Cancel",
        heightAuto: false,
        preConfirm: (val) => {
            const v = (val || "").trim();
            if (!v) {
                Swal.showValidationMessage("Name cannot be empty.");
                return false;
            }
            return v;
        },
        didOpen: () => {
            const c = Swal.getContainer?.();
            if (c) c.style.zIndex = "20000";
        },
    });

    if (!isConfirmed) return { cancelled: true };

    const res = await fetch(`${PortDocuments}/${doc.document_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headersJSON },
        body: JSON.stringify({ document_name: newName }),
    });
    const data = await res.json();
    if (!res.ok) {
        await swalBase({ icon: "error", title: "Rename Failed", text: data.error || "Update failed" });
        throw new Error(data.error || "Update failed");
    }

    await swalBase({
        icon: "success",
        title: "Saved",
        timer: 1200,
        showConfirmButton: false,
    });
    return data;
}

export async function deleteDocument(id, displayName = "") {
    const res = await swalBase({
        icon: "warning",
        title: "Delete document?",
        text: displayName ? `Delete "${displayName}"? This cannot be undone.` : "This cannot be undone.",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33",
        reverseButtons: false,
        focusCancel: true,
    });
    if (!res.isConfirmed) return { cancelled: true };

    const del = await fetch(`${PortDocuments}/${id}`, { method: "DELETE" });
    const data = await del.json();
    if (!del.ok) {
        await swalBase({ icon: "error", title: "Delete Failed", text: data.error || "Delete failed" });
        throw new Error(data.error || "Delete failed");
    }

    await swalBase({
        icon: "success",
        title: "Deleted",
        timer: 1100,
        showConfirmButton: false,
    });
    return data;
}

const DocumentsCRUD = { fetchDocuments, createDocument, deleteDocument, renameWithDialog };
export default DocumentsCRUD;
