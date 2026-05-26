import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip, Grid, Stack, Chip, Alert, FormControlLabel, Switch, Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LockResetIcon from '@mui/icons-material/LockReset';
import BlockIcon from '@mui/icons-material/Block';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { api } from '../api/client';
import PageShell from '../components/PageShell';
import AdminDataGrid from '../components/AdminDataGrid';
import { formatCurrency } from '../utils/currency';
import CellText from '../components/CellText';
import StudentEditDialog from '../components/StudentEditDialog';
import StudentBulkImportDialog from '../components/StudentBulkImportDialog';
import ConfirmDialog from '../components/ConfirmDialog';

export default function StudentsPage() {
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [snack, setSnack] = useState('');
  const [search, setSearch] = useState('');
  const [wbFilter, setWbFilter] = useState('');
  const [nraiFilter, setNraiFilter] = useState('');
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', studentId: '', password: 'Student@123',
    wbShooterId: '', nraiShooterId: '', isCustomFeeEnabled: false, customMonthlyFee: '',
  });
  const [photo, setPhoto] = useState(null);
  const qc = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['students', search, wbFilter, nraiFilter],
    queryFn: async () => {
      const params = {};
      if (search) params.search = search;
      if (wbFilter) params.wbShooterId = wbFilter;
      if (nraiFilter) params.nraiShooterId = nraiFilter;
      return (await api.get('/students', { params })).data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      return api.post('/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setOpen(false);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.patch(`/students/${id}/suspend`, { isActive }),
    onSuccess: (_, { isActive }) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setConfirm(null);
      setSnack(isActive ? 'Student activated' : 'Student suspended');
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id) => api.post(`/students/${id}/reset-password`, { password: 'Student@123' }),
    onSuccess: () => {
      setConfirm(null);
      setSnack('Password reset to Student@123');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/students/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      setConfirm(null);
      setSnack('Student deleted');
    },
  });

  const confirmLoading =
    suspendMutation.isPending || resetMutation.isPending || deleteMutation.isPending;

  const handleConfirmAction = () => {
    if (!confirm) return;
    const { type, row } = confirm;
    if (type === 'delete') deleteMutation.mutate(row.id);
    if (type === 'reset') resetMutation.mutate(row.id);
    if (type === 'suspend') suspendMutation.mutate({ id: row.id, isActive: row.nextActive });
  };

  const confirmCopy = () => {
    if (!confirm) return { title: '', message: '', confirmLabel: 'Confirm', confirmColor: 'primary' };
    const { type, row } = confirm;
    if (type === 'delete') {
      return {
        title: 'Delete student?',
        message: `Permanently delete ${row.fullName} (${row.studentId})? This removes their account and cannot be undone.`,
        confirmLabel: 'Delete',
        confirmColor: 'error',
      };
    }
    if (type === 'reset') {
      return {
        title: 'Reset password?',
        message: `Reset login password for ${row.fullName} to the default: Student@123? They will need to use this on next login.`,
        confirmLabel: 'Reset password',
        confirmColor: 'warning',
      };
    }
    if (type === 'suspend') {
      const activating = row.nextActive;
      return {
        title: activating ? 'Activate student?' : 'Suspend student?',
        message: activating
          ? `Allow ${row.fullName} (${row.studentId}) to sign in and use the student portal again?`
          : `Suspend ${row.fullName} (${row.studentId})? They will not be able to log in until reactivated.`,
        confirmLabel: activating ? 'Activate' : 'Suspend',
        confirmColor: activating ? 'success' : 'warning',
      };
    }
    return { title: 'Confirm', message: '', confirmLabel: 'Confirm', confirmColor: 'primary' };
  };

  const dialogCopy = confirmCopy();

  const sendWhatsApp = (row) => {
    const phone = row.phone?.replace(/\D/g, '');
    const msg = encodeURIComponent(`Hello ${row.fullName},\nYour monthly fees for Kalyani Shooting Academy is pending.\nPlease complete the payment at the earliest.\n\nThank you.`);
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  };

  const columns = [
    { field: 'studentId', headerName: 'Student ID', width: 110, minWidth: 100 },
    { field: 'fullName', headerName: 'Name', minWidth: 140, flex: 1, renderCell: ({ value }) => <CellText value={value} /> },
    { field: 'wbShooterId', headerName: 'WB Shooter ID', width: 130, renderCell: ({ value }) => <CellText value={value || '—'} maxWidth={120} /> },
    { field: 'nraiShooterId', headerName: 'NRAI ID', width: 120, renderCell: ({ value }) => <CellText value={value || '—'} maxWidth={110} /> },
    { field: 'phone', headerName: 'Phone', width: 120 },
    {
      field: 'effectiveFee',
      headerName: 'Fee',
      width: 110,
      renderCell: ({ row }) => (
        <Chip size="small" label={formatCurrency(row.effectiveFee)} color={row.feeType === 'custom' ? 'secondary' : 'default'} variant="outlined" />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: ({ row }) => (
        <Chip size="small" label={row.isActive ? 'Active' : 'Suspended'} color={row.isActive ? 'success' : 'error'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Edit full profile"><IconButton size="small" onClick={() => setEditId(row.id)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="WhatsApp"><IconButton size="small" color="success" onClick={() => sendWhatsApp(row)}><WhatsAppIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Reset password">
            <IconButton size="small" onClick={() => setConfirm({ type: 'reset', row })}>
              <LockResetIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={row.isActive ? 'Suspend' : 'Activate'}>
            <IconButton
              size="small"
              onClick={() => setConfirm({ type: 'suspend', row: { ...row, nextActive: !row.isActive } })}
            >
              <BlockIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setConfirm({ type: 'delete', row })}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  const rows = (students || []).map((s) => ({
    id: s._id,
    studentId: s.studentId,
    fullName: s.fullName,
    phone: s.phone,
    wbShooterId: s.wbShooterId,
    nraiShooterId: s.nraiShooterId,
    effectiveFee: s.effectiveFee,
    feeType: s.feeType,
    isActive: s.user?.isActive !== false,
    email: s.user?.email,
  }));

  return (
    <PageShell
      title="Student Management"
      subtitle="Full control: profiles, WB/NRAI IDs, custom fees, documents, suspend & reset password."
      action={
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setBulkOpen(true)}>
            Bulk import CSV
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Student
          </Button>
        </Stack>
      }
    >
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={5}>
          <TextField fullWidth size="small" label="Search name, ID, phone, email, shooter IDs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField fullWidth size="small" label="WB Shooter ID" value={wbFilter} onChange={(e) => setWbFilter(e.target.value)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField fullWidth size="small" label="NRAI Shooter ID" value={nraiFilter} onChange={(e) => setNraiFilter(e.target.value)} />
        </Grid>
      </Grid>

      <AdminDataGrid rows={rows} columns={columns} loading={isLoading} minHeight={500} />

      <StudentEditDialog studentId={editId} open={!!editId} onClose={() => setEditId(null)} />
      <StudentBulkImportDialog open={bulkOpen} onClose={() => setBulkOpen(false)} />

      <ConfirmDialog
        open={!!confirm}
        title={dialogCopy.title}
        message={dialogCopy.message}
        confirmLabel={dialogCopy.confirmLabel}
        confirmColor={dialogCopy.confirmColor}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm(null)}
        loading={confirmLoading}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Quick Add Student</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {['fullName', 'email', 'phone', 'studentId', 'password', 'wbShooterId', 'nraiShooterId'].map((key) => (
              <Grid item xs={12} sm={6} key={key}>
                <TextField fullWidth label={key} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} type={key === 'password' ? 'password' : 'text'} />
              </Grid>
            ))}
            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={form.isCustomFeeEnabled} onChange={(e) => setForm({ ...form, isCustomFeeEnabled: e.target.checked })} />}
                label="Custom monthly fee"
              />
              {form.isCustomFeeEnabled && (
                <TextField fullWidth type="number" label="Custom Fee ₹" sx={{ mt: 1 }} value={form.customMonthlyFee}
                  onChange={(e) => setForm({ ...form, customMonthlyFee: e.target.value })} />
              )}
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" component="label">Photo<input type="file" hidden accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} /></Button>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>Use Edit for full profile after creating.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => createMutation.mutate()}>Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack('')}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </PageShell>
  );
}
