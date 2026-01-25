import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, TextField, Stack, Button, Tooltip } from '@mui/material';
import { MdClose } from 'react-icons/md';

const emptyForm = {
  supplier_name: '',
  tin_number: '',
  contact_name: '',
  contact_number: '',
  email: '',
  address: '',
};

function SupplierDialog({ open, mode = 'create', initialData = {}, onClose, onSubmit }) {
  const [form, setForm] = useState({ ...emptyForm });
  const isEdit = mode === 'edit';

  useEffect(() => {
    setForm({ ...emptyForm, ...initialData });
  }, [initialData, open]);

  const title = useMemo(() => (isEdit ? 'Edit Supplier' : 'Add Supplier'), [isEdit]);

  // Conditionals
  const emailOk = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneOk = !form.contact_number || form.contact_number.length <= 100;

  const tinRaw = String(form.tin_number || '').trim();
  const tinAllowedChars = tinRaw !== '' && /^[\d-\s]+$/.test(tinRaw);
  const tinHasDigit = /\d/.test(tinRaw);
  const tinOk = tinAllowedChars && tinHasDigit;

  const canSubmit = form.supplier_name.trim() !== '' && emailOk && phoneOk && tinOk;

  const handleChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pr: 6, fontWeight: 700 }}>
        {title}
        <Tooltip title="Close">
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, }}
            color="inherit"
            size="small"
          >
            <MdClose />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Supplier Name"
            value={form.supplier_name}
            onChange={handleChange('supplier_name')}
            required
            fullWidth
          />

          <TextField
            label="TIN Number"
            value={form.tin_number}
            onChange={handleChange('tin_number')}
            error={tinRaw === '' || !tinOk}
            helperText={
              tinRaw === ''
                ? 'Required'
                : !tinAllowedChars
                  ? 'Only numbers, dashes, and spaces are allowed'
                  : !tinHasDigit
                    ? 'TIN must contain at least one number'
                    : ' '
            }
            fullWidth
          />

          <TextField
            label="Contact Name"
            value={form.contact_name}
            onChange={handleChange('contact_name')}
            fullWidth
          />
          <TextField
            label="Contact Number"
            value={form.contact_number}
            onChange={handleChange('contact_number')}
            error={!phoneOk}
            helperText={!phoneOk ? 'Too long' : ' '}
            fullWidth
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={handleChange('email')}
            error={!emailOk}
            helperText={!emailOk ? 'Invalid email' : ' '}
            fullWidth
          />
          <TextField
            label="Address"
            value={form.address}
            onChange={handleChange('address')}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button
          onClick={() => onSubmit?.(form)}
          disabled={!canSubmit}
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {isEdit ? 'Save' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SupplierDialog;