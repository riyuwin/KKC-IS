import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, Stack, Chip,
  Tooltip, IconButton,
  Divider
} from "@mui/material";
import ProductsCRUD from "../logics/products/ProductsCRUD";
import TablePager from "../components/TablePager";
import SearchBar from "../components/SearchBar";
import SortableHeader, { getComparator, stableSort } from "../components/SortableHeader";
import PurchasesCRUD from "../logics/purchases/PurchasesCRUD";
import { dateFormat } from "./DateFormat";
import { MdVisibility } from "react-icons/md";
import PurchaseDialog from "./PurchaseDialog";
import { RetrieveSales } from "../logics/admin/ManageSales";
import { RetrieveWarehouse } from "../logics/admin/ManageWarehouse";
import SalesDialog from "./SalesDialog";
import { FetchCurrentUser } from "../logics/auth/FetchCurentUser";
import {
  ResponsiveContainer,
  PieChart, Pie, Cell,
  Tooltip as ReTooltip, Legend
} from "recharts";

function peso(n) {
  if (n === "" || n === null || typeof n === "undefined") return "";
  const num = Number(n);
  if (Number.isNaN(num)) return n;
  return num.toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 });
}

function OutstandingDeliveriesTable({ stockStatus, setDataToExport }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchNow, setSearchNow] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("product_name");

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState({});

  const closeDialog = () => { setOpen(false); setSelectedId(null); setFormData({}); };

  console.log("TETATA: ", stockStatus);

  const openView = (row) => {
    setDialogMode("view");

    if (row.source === "sales") {
      setSelectedId(row.id);
      setFormData({
        sales_date: row.sales_date,
        customer_name: row.customer_name,
        product_name: row.product_name,
        quantity: row.quantity,
        delivered: row.qty_received,
        remaining: row.remaining,
        saleInfo: row.saleInfo,
        items: row.items,
        attachments: row.attachments,
      });
    } else {
      setSelectedId(row.purchase_id);
      setFormData({
        purchase_date: row.purchase_date,
        supplier_id: row.supplier_id,
        product_id: row.product_id,
        quantity: row.quantity,
        unit_cost: row.unit_cost,
        total_cost: row.total_cost,
        purchase_status: row.purchase_status,
        qty_received: row.qty_received,
        purchase_payment_status: row.purchase_payment_status,
      });
    }
    setOpen(true);
  };

  /* ------- Sales --------------- */
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sales, setSales] = useState([]);
  const [salesItems, setSalesItems] = useState([]);
  const [salesDeliveries, setSalesDeliveries] = useState([]);
  const [salesAttachments, setSalesAttachments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const accountDetails = FetchCurrentUser();
  const [salesId, setSalesId] = useState(null);

  const DialogHandler = (selectedDialogMode, data) => {
    setDialogMode(selectedDialogMode);
    setDialogOpen(true);

    if (selectedDialogMode === "View" || selectedDialogMode === "Edit") {
      /* console.log("Selected Data: ", data); */

      setSalesData({
        ...data,
        sale: data.sale,
        items: data.sales_item ? [data.sales_item] : data.items,
        product: data.product,
        attachments: data.attachments,
      });
      setSalesId(data?.saleInfo?.id);
    }
  }

  // Data Fetcher
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: salesData } = await RetrieveSales();
        setSales(salesData.sales);
        setSalesDeliveries(salesData.deliveries);
        setSalesItems(salesData.items);
        setSalesAttachments(salesData.attachments);

        const { data: warehouseData } = await RetrieveWarehouse();
        setWarehouses(warehouseData);

        const productData = await ProductsCRUD.fetchProducts();
        setProducts(productData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 2000);
    return () => clearInterval(interval);
  }, []);

  /* ----- Purchase --------- */
  useEffect(() => {
    const t = setTimeout(() => setSearchNow(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await PurchasesCRUD.fetchPurchases(searchNow);
      const result = Array.isArray(data) ? data : data?.results || [];
      setRows(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [searchNow]);

  const computedRows = useMemo(() => {
    return rows.map((r) => {
      const stock = Number(r.stock ?? 0);
      const status =
        stock <= 0 ? { label: "Out of Stock", color: "error" } :
          stock <= 5 ? { label: "Low Stock", color: "warning" } :
            { label: "In Stock", color: "success" };

      return { ...r, _stockStatus: status, source: "purchase" };
    });
  }, [rows]);

  console.log("ASGS: ", stockStatus);

  // Filter by stockStatus: "all" | "sales" | "purchase"
  const filteredRows = useMemo(() => {
    if (!stockStatus || stockStatus === "all") return computedRows;

    if (stockStatus === "sales") {
      return computedRows.filter(row => row.source === "sales");
    }

    if (stockStatus === "purchase") {
      return computedRows.filter(row => row.source === "purchase");
    }

    return computedRows;
  }, [computedRows, stockStatus]);



  const salesOutstanding = useMemo(() => {
    if (!salesDeliveries || !salesItems || !products || !sales) return [];

    return salesDeliveries
      .filter(sd => Number(sd.total_delivery_quantity) > Number(sd.total_delivered))
      .map(sd => {
        const salesItem = salesItems.find(item => item.id === sd.sales_item_id);
        const sale = sales.find(s => s.id === salesItem?.sales_id);
        const product = products.find(p => p.id === salesItem?.product_id);
        const attachments = sale
          ? salesAttachments.filter(att => att.sales_id === sale.id)
          : [];

        const sales_item_data = salesItems.find(sale_item => sale_item.id === sale.sales_item_id);
        const sales_deliveries_data = salesDeliveries.find(sale_deliveries => sale_deliveries.id === sale.sales_item_id);

        return {
          id: `sale_${sd.sales_delivery_id}`,
          sales_date: sd.created_at,
          customer_name: sale?.customer_name ?? sd.customer_name,
          sales_product_name: product?.product_name ?? `Product#${salesItem?.product_id}`,
          quantity: sd.total_delivery_quantity,
          qty_received: sd.total_delivered,
          remaining: Number(sd.total_delivery_quantity) - Number(sd.total_delivered),
          source: "sales",

          sale: sale,
          sales_item: sales_item_data,
          deliveries: sales_deliveries_data,
          product,
          attachments,

          ...sd,
        };
      });
  }, [salesDeliveries, sales, salesItems, salesAttachments, products]);

  const deliveriesWithRemaining = useMemo(() => {
    if (stockStatus === "purchase") {
      return filteredRows.filter(row => Number(row.remaining) > 0);
    }

    if (stockStatus === "sales") {
      return salesOutstanding.filter(row => Number(row.remaining) > 0);
    }

    // "all" case
    const purchaseOutstanding = filteredRows.filter(row => row.source === "purchase" && Number(row.remaining) > 0);
    const salesOutstandingRows = salesOutstanding.filter(row => row.source === "sales" && Number(row.remaining) > 0);
    return [...purchaseOutstanding, ...salesOutstandingRows];
  }, [filteredRows, salesOutstanding, stockStatus]);


  const sortedRows = useMemo(
    () => stableSort(deliveriesWithRemaining, getComparator(order, orderBy)),
    [deliveriesWithRemaining, order, orderBy]
  );

  useEffect(() => {
    if (setDataToExport) {
      setDataToExport(sortedRows);

      /* console.log("Test: ", sortedRows); */
    }
  }, [sortedRows, setDataToExport]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const headerCellSx = {
    p: 1.5, fontSize: "0.95rem", fontWeight: 700,
    bgcolor: "#706f6fff", textAlign: "center", color: "white",
  };
  const bodyCellSx = { textAlign: "center", fontSize: "0.90rem", py: 2, px: 1 };

  const outstandingSummary = useMemo(() => {
    const purchaseOutstanding = filteredRows.filter(row => row.source === "purchase" && Number(row.remaining) > 0);
    const salesOutstandingRows = salesOutstanding.filter(row => row.source === "sales" && Number(row.remaining) > 0);

    return [
      { name: "Purchases", qty: purchaseOutstanding.length },
      { name: "Sales", qty: salesOutstandingRows.length },
    ];
  }, [filteredRows, salesOutstanding]);

  const COLORS = ["#E67600", "#f9a03f", "#FFBB28", "#FF8042", "#82ca9d"];

  return (
    <Box sx={{ p: 2, fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 5, mt: 0 }}>
          Outstanding Deliveries
        </Typography>
        <Stack direction="row" spacing={2}>
          <SearchBar search={search} onSearchChange={setSearch} placeholder="Search products..." />
        </Stack>
      </Stack>

      <Paper elevation={1} sx={{ mt: 5, borderRadius: 2, bgcolor: "transparent" }}>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, border: "1px solid #ddd", boxShadow: "0px 2px 8px rgba(0,0,0,0.1)", bgcolor: "background.paper" }}
        >
          <TablePager data={sortedRows} resetOn={`${order}-${orderBy}-${searchNow}`} initialRowsPerPage={10}>
            {({ pagedRows, Pagination }) => (
              <>
                <Table size="small">
                  <TableHead sx={{ "& .MuiTableCell-root": headerCellSx }}>
                    <TableRow>
                      <SortableHeader id="no" label="No." order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="customer" label="Customer / Supplier" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="product" label="Product" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="total_ordered" label="Total Ordered" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="delivered" label="Delivered" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="remaining" label="Remaining" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="date" label="Date" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="source" label="Source" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="action" label="Action" order={order} orderBy={orderBy} onSort={handleSort} />
                    </TableRow>
                  </TableHead>

                  <TableBody sx={{ "& .MuiTableCell-root": bodyCellSx }}>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading…</Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : pagedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No outstanding deliveries with remaining items.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRows.map((row, index) => (
                        <TableRow key={row.id ?? row.product_id ?? row.sku}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {row.source === "sales"
                              ? row.customer_name
                              : row.supplier_name}
                          </TableCell>
                          <TableCell>
                            {row.source === "sales"
                              ? row.sales_product_name
                              : row.product_name}
                          </TableCell>
                          <TableCell>{row.quantity}</TableCell>
                          <TableCell>{row.qty_received}</TableCell>
                          <TableCell>{row.remaining}</TableCell>
                          <TableCell>
                            {row.source === "sales"
                              ? dateFormat(row.created_at)
                              : dateFormat(row.purchase_date)}
                          </TableCell>
                          <TableCell>
                            {row.source === "sales" ? (
                              <Chip label="Sales" color="info" size="small" />
                            ) : (
                              <Chip label="Purchase" color="primary" size="small" />
                            )}
                          </TableCell>
                          <TableCell>
                            {row.source === "sales" ? (
                              <Stack direction="row" justifyContent="center" spacing={0.5}>
                                <Tooltip title="View">
                                  <IconButton size="small" color="success" onClick={() => DialogHandler("View", row)}>
                                    <MdVisibility style={{ fontSize: 22 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            ) : (
                              <Stack direction="row" justifyContent="center" spacing={-0.4}>
                                <Tooltip title="View">
                                  <IconButton size="small" color="success" onClick={() => openView(row)}>
                                    <MdVisibility style={{ fontSize: 22 }} />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <Pagination />
              </>
            )}
          </TablePager>
        </TableContainer>
      </Paper>

      <PurchaseDialog
        open={open}
        mode={dialogMode}
        initialData={formData}
        suppliers={suppliers}
        products={products}
        onClose={closeDialog}
        onSwitchToEdit={() => setDialogMode("edit")}
        onSubmit={async (payload) => {
          try {
            const isCreate = dialogMode === "create";
            const res = isCreate
              ? await PurchasesCRUD.createPurchase(payload)
              : await PurchasesCRUD.updatePurchase(selectedId, payload);
            if (res?.cancelled) return;
            closeDialog();
            await load();
          } catch {
            // handled in PurchasesCRUD
          }
        }}
      />

      {/* Divider */}
      <Divider sx={{ my: 4, mt: 5 }} />

      <Stack sx={{ mt: 5 }} direction={{ xs: "column", md: "row" }} spacing={4}>
        <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Total Outstanding Deliveries
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outstandingSummary}
                dataKey="qty"
                nameKey="name"
                outerRadius={100}
                fill="#E67600"
                label
              >
                {outstandingSummary.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <ReTooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Stack>

      <SalesDialog
        open={dialogOpen}
        mode={dialogMode}
        accountId={accountDetails?.account_id}
        salesId={salesId}
        productsData={products}
        warehousesData={warehouses}
        salesData={salesData}
        initialData={null}
        onClose={() => setDialogOpen(false)}
        onSwitchToEdit={null}
        onSubmit={null}
      />
    </Box>
  );
}

export default OutstandingDeliveriesTable;
