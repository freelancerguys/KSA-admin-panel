import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Chip, Stack, Link, Tooltip } from '@mui/material';
import { api, getUploadUrl } from '../api/client';
import PageShell from '../components/PageShell';
import AdminDataGrid from '../components/AdminDataGrid';
import CellText from '../components/CellText';
import { formatCurrency } from '../utils/currency';

const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

export default function PaymentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => (await api.get('/payments')).data.data,
  });

  const approve = useMutation({
    mutationFn: (id) => api.patch(`/payments/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-payments'] });
    },
  });

  const reject = useMutation({
    mutationFn: (id) => api.patch(`/payments/${id}/reject`, { reason: 'Invalid proof' }),
    onSuccess: () => qc.invalidateQueries(['payments']),
  });

  const columns = [
    {
      field: 'studentName',
      headerName: 'Student',
      minWidth: 150,
      flex: 1,
      renderCell: ({ value }) => <CellText value={value} maxWidth={200} />,
    },
    { field: 'period', headerName: 'Billing Period', minWidth: 130, width: 140 },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 100,
      width: 110,
      renderCell: ({ value }) => formatCurrency(value),
    },
    {
      field: 'transactionId',
      headerName: 'Transaction ID',
      minWidth: 140,
      flex: 1,
      renderCell: ({ value }) => <CellText value={value || '—'} maxWidth={180} />,
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 110,
      width: 120,
      renderCell: ({ value }) => (
        <Chip size="small" label={value} color={statusColor[value]} sx={{ textTransform: 'capitalize' }} />
      ),
    },
    {
      field: 'proof',
      headerName: 'Proof',
      minWidth: 90,
      width: 100,
      sortable: false,
      renderCell: ({ row }) =>
        row.proofImage ? (
          <Link href={getUploadUrl(row.proofImage)} target="_blank" rel="noreferrer" underline="hover">
            View
          </Link>
        ) : (
          '—'
        ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 200,
      width: 210,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) =>
        row.status === 'pending' ? (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="Approve payment & generate invoice">
              <Button size="small" variant="contained" color="success" onClick={() => approve.mutate(row.id)}>
                Approve
              </Button>
            </Tooltip>
            <Tooltip title="Reject payment proof">
              <Button size="small" variant="outlined" color="error" onClick={() => reject.mutate(row.id)}>
                Reject
              </Button>
            </Tooltip>
          </Stack>
        ) : (
          <Chip size="small" label="Processed" variant="outlined" />
        ),
    },
  ];

  const rows = (data || []).map((p) => ({
    id: p._id,
    studentName: p.student?.fullName || 'Unknown',
    period: `${p.month} ${p.year}`,
    amount: p.amount,
    transactionId: p.transactionId,
    status: p.status,
    proofImage: p.proofImage,
  }));

  return (
    <PageShell
      title="Payment Management"
      subtitle="Review student payment proofs. Approve to generate PDF invoices automatically."
    >
      <AdminDataGrid
        rows={rows}
        columns={columns}
        loading={isLoading}
        emptyMessage="No payment records yet."
        minHeight={480}
      />
    </PageShell>
  );
}
