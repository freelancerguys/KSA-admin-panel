import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TextField, Button, Card, CardContent, Alert, Grid, Typography, Divider } from '@mui/material';
import { api } from '../api/client';
import PageShell from '../components/PageShell';

const fields = [
  { key: 'globalUPI', label: 'Global UPI ID', helper: 'Used on every student QR, invoice & payment page', required: true },
  { key: 'defaultMonthlyFee', label: 'Default Monthly Fee (₹)', type: 'number', helper: 'All students inherit unless custom fee is set' },
  { key: 'academyName', label: 'Academy Name', helper: 'Shown on invoices and UPI' },
  { key: 'paymentQrName', label: 'Payment QR Display Name', helper: 'Payee name in UPI apps' },
  { key: 'paymentDueDate', label: 'Due Date (day of month)', type: 'number', helper: 'e.g. 5 = 5th of each month' },
  { key: 'currency', label: 'Currency', helper: 'Usually INR' },
  { key: 'whatsappNumber', label: 'WhatsApp Number', helper: 'For fee reminders' },
  { key: 'invoicePrefix', label: 'Invoice Prefix', helper: 'e.g. KSA-00001' },
  { key: 'paymentInstructions', label: 'Payment Instructions', multiline: true, helper: 'Shown to students on payment page' },
];

export default function PaymentSettingsPage() {
  const [form, setForm] = useState({});
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['payment-settings'],
    queryFn: async () => (await api.get('/settings/payment')).data.data,
  });

  useEffect(() => {
    if (data) setForm({ ...data });
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.put('/settings/payment', form),
    onSuccess: () => {
      qc.invalidateQueries(['payment-settings']);
      qc.invalidateQueries(['settings']);
      qc.invalidateQueries(['students']);
      qc.invalidateQueries(['student']);
    },
  });

  return (
    <PageShell
      title="Global Payment Settings"
      subtitle="Changes apply instantly to all students — QR codes, fees, and invoices. No hardcoded UPI."
    >
      <Card>
        <CardContent>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Updating <strong>Global UPI ID</strong> reflects across the entire application immediately.
          </Alert>
          {isLoading ? (
            <Typography>Loading...</Typography>
          ) : (
            <Grid container spacing={2.5}>
              {fields.map((f) => (
                <Grid item xs={12} md={f.multiline ? 12 : 6} key={f.key}>
                  <TextField
                    fullWidth
                    required={f.required}
                    type={f.type || 'text'}
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
                <Divider sx={{ my: 1 }} />
                <Button variant="contained" size="large" onClick={() => save.mutate()} disabled={save.isPending}>
                  Save Global Settings
                </Button>
                {save.isSuccess && (
                  <Alert severity="success" sx={{ mt: 2 }}>Settings saved. All student payment pages updated.</Alert>
                )}
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
