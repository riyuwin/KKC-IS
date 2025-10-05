import Swal from 'sweetalert2';
import {  PortSalesReturns,  PortPurchaseReturns,  PortProducts,  PortSuppliers,  PortSales } from '../../api_ports/api';


export async function RetrieveSalesReturns(search='') {
  const url = search ? `${PortSalesReturns}?search=${encodeURIComponent(search)}` : PortSalesReturns;
  const res = await fetch(url);
  return { data: await res.json() };
}

export async function RetrievePurchaseReturns(search='') {
  const url = search ? `${PortPurchaseReturns}?search=${encodeURIComponent(search)}` : PortPurchaseReturns;
  const res = await fetch(url);
  return { data: await res.json() };
}

// dropdown options
export async function RetrieveProducts() {
  const res = await fetch(PortProducts);
  const data = await res.json();
  return data.map(p => ({ label: `${p.product_name} (${p.sku})`, value: p.product_id }));
}

export async function RetrieveSuppliers() {
  const res = await fetch(PortSuppliers);
  const data = await res.json();
  return data.map(s => ({ label: s.supplier_name, value: s.supplier_id }));
}

// derive customers from /sales
export async function RetrieveCustomersFromSales() {
  const res = await fetch(PortSales);
  const data = await res.json(); // { sales, items, deliveries, attachments }
  const names = Array.isArray(data?.sales) ? data.sales.map(s => s.customer_name).filter(Boolean) : [];
  const unique = [...new Set(names)].sort((a,b)=>a.localeCompare(b));
  return unique.map(name => ({ label: name, value: name }));
}

// sales returns
export async function InsertSalesReturn(payload) {
  const res = await fetch(PortSalesReturns, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Create sales return failed.');
  Swal.fire({ icon: 'success', title: 'Sales Return', text: 'Created successfully.' });
}

export async function UpdateSalesReturn(id, payload) {
  const res = await fetch(`${PortSalesReturns}/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update sales return failed.');
  Swal.fire({ icon: 'success', title: 'Sales Return', text: 'Updated successfully.' });
}

export async function DeleteSalesReturn(id) {
  const ask = await Swal.fire({ title: 'Delete sales return?', icon: 'warning', showCancelButton: true });
  if (!ask.isConfirmed) return;
  const res = await fetch(`${PortSalesReturns}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed.');
  Swal.fire({ icon: 'success', title: 'Deleted', text: 'Sales return removed.' });
}

// purchase returns
export async function InsertPurchaseReturn(payload) {
  const res = await fetch(PortPurchaseReturns, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Create purchase return failed.');
  Swal.fire({ icon: 'success', title: 'Purchase Return', text: 'Created successfully.' });
}

export async function UpdatePurchaseReturn(id, payload) {
  const res = await fetch(`${PortPurchaseReturns}/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update purchase return failed.');
  Swal.fire({ icon: 'success', title: 'Purchase Return', text: 'Updated successfully.' });
}

export async function DeletePurchaseReturn(id) {
  const ask = await Swal.fire({ title: 'Delete purchase return?', icon: 'warning', showCancelButton: true });
  if (!ask.isConfirmed) return;
  const res = await fetch(`${PortPurchaseReturns}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Delete failed.');
  Swal.fire({ icon: 'success', title: 'Deleted', text: 'Purchase return removed.' });
}
