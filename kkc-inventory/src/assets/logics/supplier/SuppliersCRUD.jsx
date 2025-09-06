import Swal from 'sweetalert2';
import { PortSuppliers } from '../../api_ports/api';

const headers = { 'Content-Type': 'application/json' };

const swalFire = (opts) =>
  Swal.fire({
    heightAuto: false,
    ...opts,
    didOpen: () => {
      const c = Swal.getContainer?.();
      if (c) c.style.zIndex = '20000'; // higher than MUI Dialog (1300)
    },
  });

const swalConfirm = async (title, text) => {
  const res = await swalFire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No',
    reverseButtons: false, 
    focusCancel: true,
  });
  return res.isConfirmed;
};

export async function fetchSuppliers(search = '') {
  try {
    const url = new URL(PortSuppliers);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch suppliers');
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Load Failed', text: err.message });
    return [];
  }
}

export async function createSupplier(payload) {
  const ok = await swalConfirm('Add supplier?', 'This will create a new supplier.');
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(PortSuppliers, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Create failed');

    await swalFire({
      icon: 'success',
      title: 'Supplier Created',
      text: 'New supplier has been added.',
      timer: 1400,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Create Failed', text: err.message });
    throw err;
  }
}

export async function updateSupplier(id, payload) {
  const ok = await swalConfirm('Update supplier?', 'Save changes to this supplier?');
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(`${PortSuppliers}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');

    await swalFire({
      icon: 'success',
      title: 'Supplier Updated',
      text: 'Changes saved successfully.',
      timer: 1400,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Update Failed', text: err.message });
    throw err;
  }
}

export async function deleteSupplier(id, displayName = '') {
  try {
    const result = await swalFire({
      title: 'Delete supplier?',
      text: displayName ? `Delete "${displayName}"? This cannot be undone.` : 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: false, 
      focusCancel: true,
    });
    if (!result.isConfirmed) return { cancelled: true };

    const res = await fetch(`${PortSuppliers}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');

    await swalFire({
      icon: 'success',
      title: 'Deleted',
      text: 'Supplier has been deleted.',
      timer: 1200,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Delete Failed', text: err.message });
    throw err;
  }
}

const SuppliersCRUD = { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier };
export default SuppliersCRUD;
