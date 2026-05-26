import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField, Button, Card, CardContent, Alert, Grid, Typography } from '@mui/material';
import { api } from '../api/client';
import PageShell from '../components/PageShell';

export default function FeesPage() {
  const [monthlyFee, setMonthlyFee] = useState('');
  const [defaultUpi, setDefaultUpi] = useState('');
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => (await api.get('/cms/settings')).data.data,
  });

  useEffect(() => {
    if (settings) {
      setMonthlyFee(String(settings.monthlyFee ?? ''));
      setDefaultUpi(settings.defaultUpiId ?? '');
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      await api.put('/cms/settings', { key: 'monthlyFee', value: Number(monthlyFee) });
      await api.put('/cms/settings', { key: 'defaultUpiId', value: defaultUpi });
    },
    onSuccess: () => qc.invalidateQueries(['settings']),
  });

  return (
    <PageShell
      title="Fee Settings"
      subtitle="Default monthly fee and UPI ID used when generating payment QR codes for students."
    >
      <Card sx={{ maxWidth: 560 }}>
        <CardContent>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Monthly Fee (₹)"
                type="number"
                value={monthlyFee}
                onChange={(e) => setMonthlyFee(e.target.value)}
                helperText="Applied to new students unless overridden individually."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default UPI ID"
                value={defaultUpi}
                onChange={(e) => setDefaultUpi(e.target.value)}
                helperText="Example: yourname@oksbi — used in UPI QR generation."
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>
                Save Fee Settings
              </Button>
              {save.isSuccess && <Alert severity="success" sx={{ mt: 2 }}>Settings saved successfully.</Alert>}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </PageShell>
  );
}
