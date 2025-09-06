import Swal from 'sweetalert2';
import { PortProducts } from '../../api_ports/api';

const headers = { 'Content-Type': 'application/json' };

// alerts above MUI dialog (para di na kailangan i-cancel ang para lang makita yung alert)
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

async function fetchProducts(search = '') {
  try {
    const url = new URL(PortProducts);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Load Failed', text: err.message });
    return [];
  }
}

async function createProduct(payload) {
  const ok = await swalConfirm('Add product?', 'This will create a new product.');
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(PortProducts, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Create failed');

    await swalFire({
      icon: 'success',
      title: 'Product Created',
      text: 'New product has been added.',
      timer: 1400,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Create Failed', text: err.message });
    throw err;
  }
}

async function updateProduct(id, payload) {
  const ok = await swalConfirm('Update product?', 'Save changes to this product?');
  if (!ok) return { cancelled: true };

  try {
    const res = await fetch(`${PortProducts}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');

    await swalFire({
      icon: 'success',
      title: 'Product Updated',
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

async function deleteProduct(id, displayName = '') {
  const result = await swalFire({
    title: 'Delete product?',
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

  try {
    const res = await fetch(`${PortProducts}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');

    await swalFire({
      icon: 'success',
      title: 'Deleted',
      text: 'Product has been deleted.',
      timer: 1200,
      showConfirmButton: false,
    });
    return data;
  } catch (err) {
    await swalFire({ icon: 'error', title: 'Delete Failed', text: err.message });
    throw err;
  }
}

const ProductsCRUD = { fetchProducts, createProduct, updateProduct, deleteProduct };
export default ProductsCRUD;
