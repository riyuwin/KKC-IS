import { PortProducts } from '../../api_ports/api';

const headers = { 'Content-Type': 'application/json' };


async function fetchProducts(search = '') {
    const url = new URL(PortProducts);
    if (search) url.searchParams.set('search', search);
    const res = await fetch(url.toString(), { method: 'GET' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
    return data;
}


async function createProduct(payload) {
    const res = await fetch(PortProducts, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Create failed');
    return data;
}


async function updateProduct(id, payload) {
    const res = await fetch(`${PortProducts}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');
    return data;
}


async function deleteProduct(id) {
    const res = await fetch(`${PortProducts}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Delete failed');
    return data;
}


const ProductsCRUD = { fetchProducts, createProduct, updateProduct, deleteProduct };
export default ProductsCRUD;