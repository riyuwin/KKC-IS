import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, CircularProgress, Tooltip, Stack } from '@mui/material';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import SuppliersCRUD from '../logics/supplier/SuppliersCRUD';
import SupplierDialog from '../components/SupplierDialog';
import SortableHeader, { getComparator, stableSort } from '../components/SortableHeader';
import SearchBar from '../components/SearchBar';
import TablePager from '../components/TablePager';

function Suppliers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // search state (debounced)
  const [search, setSearch] = useState('');
  const [searchNow, setSearchNow] = useState('');

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('create'); // 'create' | 'edit'
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({});

  // Sorting
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('supplier_name');
  const handleSort = (prop) => {
    const isAsc = orderBy === prop && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };

  useEffect(() => {
    const t = setTimeout(() => setSearchNow(search), 150);
    return () => clearTimeout(t);
  }, [search]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await SuppliersCRUD.fetchSuppliers(searchNow);
      setRows(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [searchNow]);

  const sortedRows = useMemo(
    () => stableSort(rows, getComparator(order, orderBy)),
    [rows, order, orderBy]
  );

  const closeDialog = () => {
    setOpen(false);
    setSelectedId(null);
    setForm({});
  };

  const openCreate = () => {
    setMode('create');
    setForm({});
    setSelectedId(null);
    setOpen(true);
  };

  const openEdit = (row) => {
    setMode('edit');
    setSelectedId(row.supplier_id);
    setForm({
      supplier_name: row.supplier_name || '',
      contact_name: row.contact_name || '',
      contact_number: row.contact_number || '',
      email: row.email || '',
      address: row.address || '',
    });
    setOpen(true);
  };

  const handleDelete = async (row) => {
    const id = row.supplier_id;
    if (!id) return;
    const res = await SuppliersCRUD.deleteSupplier(id, row.supplier_name);
    if (!res?.cancelled) load();
  };


  const headerCellSx = {
    p: 1.5,
    fontSize: '0.95rem',
    fontWeight: 700,
    bgcolor: '#706f6fff',
    textAlign: 'center',
    color: 'white',
  };
  const bodyCellSx = {
    textAlign: 'center',
    fontSize: '0.90rem',
    py: 2,
    px: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };
  const wrapCellSx = {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    textOverflow: 'clip',
    overflow: 'visible',
    maxWidth: 'none',
    px: 1.25,
  };

  return (
    <Box sx={{ p: 2, fontFamily: 'Poppins, sans-serif' }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 5, mt: -6 }}>
        Suppliers
      </Typography>

      {/* Search left, Add right */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, px: 1 }} spacing={2}>
        <SearchBar search={search} onSearchChange={setSearch} placeholder="Search suppliers..." />
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          onClick={openCreate}
          sx={{
            bgcolor: '#E67600',
            '&:hover': { bgcolor: '#f99f3fff' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Add Supplier
        </Button>
      </Stack>

      {/* Table */}
      <Paper elevation={1} sx={{ borderRadius: 2, bgcolor: 'transparent', boxShadow: 'none' }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 2,
            border: '1px solid #ddd',
            boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
            bgcolor: 'background.paper',
          }}
        >
          <TablePager data={sortedRows} resetOn={`${order}-${orderBy}-${searchNow}`} initialRowsPerPage={5}>
            {({ pagedRows, Pagination }) => (
              <>
                <Table size="small">
                  <TableHead sx={{ '& .MuiTableCell-root': headerCellSx }}>
                    <TableRow>
                      <SortableHeader id="supplier_name" label="Supplier Name" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="contact_name" label="Contact Name" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="contact_number" label="Contact Number" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="email" label="Email" order={order} orderBy={orderBy} onSort={handleSort} />
                      <SortableHeader id="address" label="Address" order={order} orderBy={orderBy} onSort={handleSort} />
                      <TableCell sx={{ ...headerCellSx }} width={140}>Actions</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody sx={{ '& .MuiTableCell-root': bodyCellSx }}>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" py={2}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Loading…</Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : pagedRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" py={2}>
                            No suppliers found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pagedRows.map((row) => (
                        <TableRow key={row.supplier_id}>
                          <TableCell>{row.supplier_name}</TableCell>
                          <TableCell>{row.contact_name}</TableCell>
                          <TableCell>{row.contact_number}</TableCell>
                          <TableCell>{row.email}</TableCell>
                          <TableCell sx={wrapCellSx}>{row.address}</TableCell>
                          <TableCell>
                            <Stack direction="row" justifyContent="center">
                              <Tooltip title="Edit">
                                <IconButton size="medium" color="primary" onClick={() => openEdit(row)}>
                                  <MdEdit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="medium" color="error" onClick={() => handleDelete(row)}>
                                  <MdDelete />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <Pagination />
              </>
            )}
          </TablePager>
        </TableContainer>
      </Paper>

      {/* Dialog */}
      <SupplierDialog
        open={open}
        mode={mode}
        initialData={form}
        onClose={closeDialog}
        onSubmit={async (payload) => {
          try {
            let res;
            if (mode === 'create') {
              res = await SuppliersCRUD.createSupplier(payload);
            } else {
              res = await SuppliersCRUD.updateSupplier(selectedId, payload);
            }
            if (res?.cancelled) return;
            closeDialog();
            await load();
          } catch {
            // errors already alerted by SuppliersCRUD
          }
        }}
      />

    </Box>
  );
}

export default Suppliers;
