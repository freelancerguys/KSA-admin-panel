import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
} from '@mui/material';
import ReactQuill from 'react-quill';
import AddIcon from '@mui/icons-material/Add';
import { api } from '../api/client';
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
};

const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export default function CmsPage({
  title,
  subtitle,
  endpoint,
  fields = ['title', 'description'],
  imageField = 'image',
  richField = null,
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: async () => (await api.get(`/cms/${endpoint}`)).data.data,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append(imageField, file);
      return api.post(`/cms/${endpoint}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      qc.invalidateQueries([endpoint]);
      setOpen(false);
      setForm({});
      setFile(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/cms/${endpoint}/${id}`),
    onSuccess: () => qc.invalidateQueries([endpoint]),
  });

  const columns = [
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
      minWidth: 100,
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Button size="small" color="error" variant="outlined" onClick={() => deleteMutation.mutate(row.id)}>
          Delete
        </Button>
      ),
    },
  ];

  const rows = (data || []).map((item) => ({ ...item, id: item._id }));

  return (
    <PageShell
      title={title}
      subtitle={subtitle || `Manage ${title.toLowerCase()} shown on the public website.`}
      action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 700 }}>Add — {title}</DialogTitle>
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
            <Grid item xs={12}>
              <Button variant="outlined" component="label">
                Upload Image
                <input type="file" hidden accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
              </Button>
              {file && <Box component="span" ml={2}>{file.name}</Box>}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageShell>
  );
}
