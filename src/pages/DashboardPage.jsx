import { useQuery } from '@tanstack/react-query';
import { Grid, Card, CardContent, Typography, Skeleton, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../api/client';
import PageShell from '../components/PageShell';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#FFD600', '#111111', '#4caf50', '#ff9800'];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/students/admin/stats')).data.data,
  });

  const cards = [
    { label: 'Total Students', value: data?.totalStudents, color: '#111' },
    { label: 'Pending Payments', value: data?.pendingPayments, color: '#ed6c02' },
    { label: 'Approved Payments', value: data?.approvedPayments, color: '#2e7d32' },
  ];

  const pieData = [
    { name: 'Pending', value: data?.pendingPayments || 0 },
    { name: 'Approved', value: data?.approvedPayments || 0 },
  ];

  const barData = (data?.recentPayments || []).map((p) => ({
    name: p.student?.fullName?.split(' ')[0] || 'Student',
    amount: p.amount,
  }));

  if (isLoading) {
    return (
      <PageShell title="Dashboard" subtitle="Overview of students and payments.">
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={320} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Dashboard" subtitle="Overview of students and payments.">
      <Grid container spacing={2.5}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {c.label}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ color: c.color }}>
                  {c.value ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>Payment Overview</Typography>
              <Box sx={{ width: '100%', height: 260, minHeight: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>Recent Payment Amounts</Typography>
              <Box sx={{ width: '100%', height: 260, minHeight: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: 8, right: 8, bottom: 8 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Amount']} />
                    <Bar dataKey="amount" fill="#111" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageShell>
  );
}
