import Swal from 'sweetalert2';
import { PortPurchases } from '../../api_ports/api';

const headers = { 'Content-Type': 'application/json' };

const swalFire = (opts) =>
  Swal.fire({
    heightAuto: false,
    ...opts,
    didOpen: () => {
      const c = Swal.getContainer?.();
      if (c) c.style.zIndex = '20000'; // above MUI dialog
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

async function fetchPurchases(search = '', warehouseId = null) {      
  try {
    const url = new URL(PortPurchases);
    if (search) url.searchParams.set('search', search);
    if (warehouseId) {                      
      url.searchParams.set('warehouse_id', warehouseId);             
    }                                                                

    const res = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',                                        
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch purchases');
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Load Failed', text: err.message });
    return [];
  }
}

async function createPurchase(payload) {
  const ok = await swalConfirm('Add purchase?', 'This will create a new purchase.');
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(PortPurchases, {
      method: 'POST',
      headers,
      credentials: 'include',                                       
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Create failed');

    await swalFire({
      icon: 'success',
      title: 'Purchase Created',
      text: 'New purchase has been added.',
      timer: 1400,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Create Failed', text: err.message });
    throw err;
  }
}

// create bulk purchases (multi-line, multi-supplier)
async function createBulkPurchase(payload) {
  const ok = await swalConfirm(
    'Add purchases?',
    'This will create one purchase per supplier from these items.'
  );
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(`${PortPurchases}/bulk`, {
      method: 'POST',
      headers,
      credentials: 'include',                                       
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Bulk create failed');

    await swalFire({
      icon: 'success',
      title: 'Purchases Created',
      text: 'Bulk purchases have been added.',
      timer: 1400,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Bulk Create Failed', text: err.message });
    throw err;
  }
}

async function updatePurchase(id, payload) {
  const ok = await swalConfirm('Update purchase?', 'Save changes to this purchase?');
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(`${PortPurchases}/${id}`, {
      method: 'PUT',
      headers,
      credentials: 'include',                                       
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');

    await swalFire({
      icon: 'success',
      title: 'Purchase Updated',
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

async function deletePurchase(id, displayLabel) {
  const result = await swalFire({
    title: 'Delete purchase?',
    text: displayLabel ? `This will remove Purchase #${displayLabel}.` : 'This will remove the purchase.',
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

  try {
    const res = await fetch(`${PortPurchases}/${id}`, {
      method: 'DELETE',
      credentials: 'include',                                      
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');

    await swalFire({
      icon: 'success',
      title: 'Deleted',
      text: 'Purchase has been deleted.',
      timer: 1200,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Delete Failed', text: err.message });
    throw err;
  }
}

const PurchasesCRUD = {
  fetchPurchases,
  createPurchase,
  createBulkPurchase,
  updatePurchase,
  deletePurchase,
};

export default PurchasesCRUD;
