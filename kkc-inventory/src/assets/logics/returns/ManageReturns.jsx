import Swal from "sweetalert2";
import { PortSalesReturns, PortPurchaseReturns, PortProducts, PortSuppliers, PortSales, PortDashboard } from '../../api_ports/api';

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// ---- returns list ----
export async function RetrieveSalesReturns(search = "", warehouseId = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (warehouseId && warehouseId !== "all") params.set("warehouse_id", warehouseId);
  const url = params.toString() ? `${PortSalesReturns}?${params}` : PortSalesReturns;

  const data = await apiFetch(url);
  return { data: Array.isArray(data) ? data : [] };
}

export async function RetrievePurchaseReturns(search = "", warehouseId = "all") {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (warehouseId && warehouseId !== "all") params.set("warehouse_id", warehouseId);
  const url = params.toString() ? `${PortPurchaseReturns}?${params}` : PortPurchaseReturns;

  const data = await apiFetch(url);
  return { data: Array.isArray(data) ? data : [] };
}

// ---- dropdown options ----
// FULL product rows (needs supplier info + warehouse info for admin)
export async function RetrieveProductsWithSupplier(warehouseId = "all") {
  const params = new URLSearchParams();
  if (warehouseId && warehouseId !== "all") params.set("warehouse_id", warehouseId);
  const url = params.toString() ? `${PortProducts}?${params}` : PortProducts;

  const data = await apiFetch(url);
  const rows = Array.isArray(data) ? data : [];
  return rows.map((p) => ({
    label: `${p.product_name} (${p.sku})`,
    value: p.product_id,
    supplier_id: p.supplier_id || null,
    supplier_name: p.supplier_name || "",
    warehouse_id: p.warehouse_id || null,
    warehouse_name: p.warehouse_name || "",
  }));
}

export async function RetrieveSuppliers() {
  const data = await apiFetch(PortSuppliers);
  const rows = Array.isArray(data) ? data : [];
  return rows.map((s) => ({ label: s.supplier_name, value: s.supplier_id }));
}

// derive customers from /sales
export async function RetrieveCustomersFromSales(warehouseId = "all") {
  const data = await apiFetch(PortSales);
  const sales = Array.isArray(data?.sales) ? data.sales : [];

  const filtered =
    warehouseId && warehouseId !== "all"
      ? sales.filter((s) => String(s.warehouse_id) === String(warehouseId))
      : sales;

  const names = filtered.map((s) => s.customer_name).filter(Boolean);
  const unique = [...new Set(names)].sort((a, b) => a.localeCompare(b));
  return unique.map((name) => ({ label: name, value: name }));
}

// warehouses list (admin will get all, warehouse user gets their own)
export async function RetrieveWarehousesForFilter() {
  const data = await apiFetch(PortDashboard);
  return Array.isArray(data) ? data : [];
}

export async function InsertSalesReturn(payload) {
  await apiFetch(PortSalesReturns, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  Swal.fire({ icon: "success", title: "Sales Return", text: "Created successfully." });
}

export async function UpdateSalesReturn(id, payload) {
  await apiFetch(`${PortSalesReturns}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  Swal.fire({ icon: "success", title: "Sales Return", text: "Updated successfully." });
}

export async function DeleteSalesReturn(id) {
  const ask = await Swal.fire({ title: "Delete sales return?", icon: "warning", showCancelButton: true });
  if (!ask.isConfirmed) return;

  await apiFetch(`${PortSalesReturns}/${id}`, { method: "DELETE" });
  Swal.fire({ icon: "success", title: "Deleted", text: "Sales return removed." });
}

export async function InsertPurchaseReturn(payload) {
  await apiFetch(PortPurchaseReturns, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  Swal.fire({ icon: "success", title: "Purchase Return", text: "Created successfully." });
}

export async function UpdatePurchaseReturn(id, payload) {
  await apiFetch(`${PortPurchaseReturns}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  Swal.fire({ icon: "success", title: "Purchase Return", text: "Updated successfully." });
}

export async function DeletePurchaseReturn(id) {
  const ask = await Swal.fire({ title: "Delete purchase return?", icon: "warning", showCancelButton: true });
  if (!ask.isConfirmed) return;

  await apiFetch(`${PortPurchaseReturns}/${id}`, { method: "DELETE" });
  Swal.fire({ icon: "success", title: "Deleted", text: "Purchase return removed." });
}
