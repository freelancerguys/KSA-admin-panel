import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField, Button, Grid, Card, CardContent, Alert } from '@mui/material';
import { api } from '../api/client';
import PageShell from '../components/PageShell';

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/cms/settings')).data.data,
  });

  const [form, setForm] = useState({});

  useEffect(() => {
    if (settings) {
      setForm({
        heroTitle: settings.heroTitle ?? '',
        heroSubtitle: settings.heroSubtitle ?? '',
        aboutText: settings.aboutText ?? '',
        contactPhone: settings.contactPhone ?? '',
        contactEmail: settings.contactEmail ?? '',
        contactAddress: settings.contactAddress ?? '',
      });
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const keys = Object.keys(form);
      for (const key of keys) {
        await api.put('/cms/settings', { key, value: form[key] });
      }
    },
    onSuccess: () => qc.invalidateQueries(['settings']),
  });

  const fields = [
    { key: 'heroTitle', label: 'Hero Title', helper: 'Main headline on the homepage' },
    { key: 'heroSubtitle', label: 'Hero Subtitle', helper: 'Tagline below the headline' },
    { key: 'aboutText', label: 'About Section', multiline: true, helper: 'Academy introduction text' },
    { key: 'contactPhone', label: 'Contact Phone', helper: 'Shown in footer and contact section' },
    { key: 'contactEmail', label: 'Contact Email', helper: 'Public inquiry email' },
    { key: 'contactAddress', label: 'Contact Address', multiline: true, helper: 'Academy location' },
  ];

  return (
    <PageShell
      title="Website CMS Settings"
      subtitle="Edit homepage hero, about, and contact details displayed on the public website."
    >
      <Card>
        <CardContent>
          <Grid container spacing={2.5}>
            {fields.map((f) => (
              <Grid item xs={12} md={6} key={f.key}>
                <TextField
                  fullWidth
                  label={f.label}
                  helperText={f.helper}
                  multiline={f.multiline}
                  rows={f.multiline ? 3 : 1}
                  value={form[f.key] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>
                Save CMS Settings
              </Button>
              {save.isSuccess && <Alert severity="success" sx={{ mt: 2 }}>Website content updated.</Alert>}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </PageShell>
  );
}
