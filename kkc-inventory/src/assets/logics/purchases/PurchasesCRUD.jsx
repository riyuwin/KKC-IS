import { PortPurchases } from "../../api_ports/api";

const headers = { 'Content-Type': 'application/json' };

async function fetchPurchases(search = '') {
  const url = new URL(PortPurchases);
  if (search) url.searchParams.set('search', search);
  const res = await fetch(url.toString(), { method: 'GET' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch purchases');
  return data;
}

async function createPurchase(payload) {
  const res = await fetch(PortPurchases, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Create failed');
  return data;
}

async function updatePurchase(id, payload) {
  const res = await fetch(`${PortPurchases}/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update failed');
  return data;
}

async function deletePurchase(id) {
  const res = await fetch(`${PortPurchases}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed');
  return data;
}

const PurchasesCRUD = { fetchPurchases, createPurchase, updatePurchase, deletePurchase };
export default PurchasesCRUD;
