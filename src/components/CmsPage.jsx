import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import ReactQuill from 'react-quill';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { api, getUploadUrl } from '../api/client';
import PageShell from './PageShell';
import AdminDataGrid from './AdminDataGrid';
import CellText from './CellText';

const FIELD_LABELS = {
  title: 'Title',
  excerpt: 'Short Excerpt',
  content: 'Content',
  description: 'Description',
  caption: 'Caption',
  category: 'Category',
  eventDate: 'Event Date',
  achievementDate: 'Achievement Date',
  order: 'Display Order',
};

const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const emptyForm = (fields, dateFields, numberFields, hasPublished) => {
  const base = fields.reduce((acc, f) => ({ ...acc, [f]: '' }), {});
  dateFields.forEach((f) => { base[f] = ''; });
  numberFields.forEach((f) => { base[f] = 0; });
  if (hasPublished) base.isPublished = true;
  return base;
};

export default function CmsPage({
  title,
  subtitle,
  endpoint,
  fields = ['title', 'description'],
  imageField = 'image',
  richField = null,
  dateFields = [],
  numberFields = [],
  showPublishedToggle = false,
}) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(fields, dateFields, numberFields, showPublishedToggle));
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await api.get(`/cms/${endpoint}`)).data.data,
  });

  const resetDialog = () => {
    setOpen(false);
    setEditingId(null);
    setForm(emptyForm(fields, dateFields, numberFields, showPublishedToggle));
    setFile(null);
    setExistingImage('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm(fields, dateFields, numberFields, showPublishedToggle));
    setFile(null);
    setExistingImage('');
    setOpen(true);
  };

  const openEdit = (row) => {
    const next = emptyForm(fields, dateFields, numberFields, showPublishedToggle);
    fields.forEach((f) => {
      next[f] = row[f] ?? '';
    });
    dateFields.forEach((f) => {
      next[f] = toDateInput(row[f]);
    });
    numberFields.forEach((f) => {
      next[f] = row[f] ?? 0;
    });
    if (showPublishedToggle) {
      next.isPublished = row.isPublished !== false;
    }
    setEditingId(row.id);
    setForm(next);
    setFile(null);
    setExistingImage(row[imageField] || '');
    setOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        if (typeof v === 'boolean') {
          fd.append(k, v ? 'true' : 'false');
        } else {
          fd.append(k, v);
        }
      });
      if (file) fd.append(imageField, file);
      if (editingId) {
        return api.put(`/cms/${endpoint}/${editingId}`, fd);
      }
      return api.post(`/cms/${endpoint}`, fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [endpoint] });
      resetDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/cms/${endpoint}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [endpoint] }),
  });

  const imagePreview = file
    ? URL.createObjectURL(file)
    : existingImage
      ? getUploadUrl(existingImage)
      : '';

  const columns = [
    {
      field: 'serial',
      headerName: '#',
      width: 72,
      sortable: false,
      filterable: false,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          {String(value).padStart(2, '0')}
        </Typography>
      ),
    },
    ...fields.map((f) => ({
      field: f,
      headerName: FIELD_LABELS[f] || f,
      minWidth: f === 'content' || f === 'description' ? 200 : 140,
      flex: 1,
      renderCell: ({ value }) => (
        <CellText
          value={richField === f ? stripHtml(value).slice(0, 80) : value}
          maxWidth={280}
        />
      ),
    })),
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 160,
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.75}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => openEdit(row)}
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => {
              if (window.confirm('Delete this item permanently?')) {
                deleteMutation.mutate(row.id);
              }
            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const rows = (data || []).map((item, index) => ({ ...item, id: item._id, serial: index + 1 }));

  const entryCount = rows.length;

  return (
    <PageShell
      title={title}
      subtitle={
        subtitle
          ? `${subtitle} · ${entryCount} ${entryCount === 1 ? 'entry' : 'entries'}`
          : `${entryCount} ${entryCount === 1 ? 'entry' : 'entries'} shown on the public website when published.`
      }
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add New
        </Button>
      }
    >
      <AdminDataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        emptyMessage={`No ${title.toLowerCase()} entries yet.`}
        minHeight={440}
      />

      <Dialog open={open} onClose={resetDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId ? 'Edit' : 'Add'} — {title}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {fields.map((f) => (
              <Grid item xs={12} key={f}>
                {richField === f ? (
                  <Box>
                    <Box fontWeight={600} mb={1}>{FIELD_LABELS[f] || f}</Box>
                    <ReactQuill value={form[f] || ''} onChange={(v) => setForm({ ...form, [f]: v })} />
                  </Box>
                ) : (
                  <TextField
                    fullWidth
                    label={FIELD_LABELS[f] || f}
                    value={form[f] || ''}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    multiline={f.includes('description') || f === 'content' || f === 'excerpt'}
                    rows={f.includes('description') || f === 'content' ? 4 : f === 'excerpt' ? 2 : 1}
                  />
                )}
              </Grid>
            ))}

            {dateFields.map((f) => (
              <Grid item xs={12} sm={6} key={f}>
                <TextField
                  fullWidth
                  type="date"
                  label={FIELD_LABELS[f] || f}
                  value={form[f] || ''}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            ))}

            {numberFields.map((f) => (
              <Grid item xs={12} sm={6} key={f}>
                <TextField
                  fullWidth
                  type="number"
                  label={FIELD_LABELS[f] || f}
                  value={form[f] ?? 0}
                  onChange={(e) => setForm({ ...form, [f]: Number(e.target.value) })}
                />
              </Grid>
            ))}

            {showPublishedToggle && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.isPublished}
                      onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    />
                  }
                  label="Published on website"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                {existingImage || file ? 'Change image' : 'Upload image'}
                <input type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </Button>
              {file && (
                <Typography variant="body2" component="span" ml={2}>
                  {file.name}
                </Typography>
              )}
              {!file && existingImage && (
                <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                  Current image kept unless you upload a new one
                </Typography>
              )}
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{ display: 'block', mt: 2, maxHeight: 200, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                />
              )}
            </Grid>
          </Grid>

          {saveMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {saveMutation.error?.response?.data?.message || 'Could not save. Please try again.'}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={resetDialog}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : editingId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
