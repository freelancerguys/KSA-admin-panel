import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Grid, Typography, Card, CardContent, Skeleton, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid, LineChart, Line,
} from 'recharts';
import { FaUsers, FaClock, FaCheckCircle, FaTimesCircle, FaRupeeSign, FaExclamationTriangle } from 'react-icons/fa';
import { MdOutlineSportsScore } from 'react-icons/md';
import { HiUserRemove } from 'react-icons/hi';
import { api } from '../api/client';
import { formatCurrency } from '../utils/currency';
import { kpiGradients } from '../theme/dashboardTheme';
import KpiCard from '../components/dashboard/KpiCard';
import PendingApprovals from '../components/dashboard/PendingApprovals';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import TopShooters from '../components/dashboard/TopShooters';
import RecentPaymentsTable from '../components/dashboard/RecentPaymentsTable';
import QuickActionsFab from '../components/dashboard/QuickActionsFab';

const ChartCard = ({ title, subtitle, children, loading, height = 300 }) => (
  <Card sx={{ borderRadius: 3, height: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
    <CardContent>
      <Typography variant="h6" fontWeight={800}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mb={2}>{subtitle}</Typography>
      )}
      {loading ? <Skeleton variant="rounded" height={height} /> : (
        <Box sx={{ width: '100%', height, minHeight: 220 }}>{children}</Box>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const qc = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [payPage, setPayPage] = useState(0);
  const [paySearch, setPaySearch] = useState('');
  const [payStatus, setPayStatus] = useState('');
  const limit = 8;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await api.get('/admin/dashboard/stats')).data.data,
    staleTime: 60_000,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: async () => (await api.get('/admin/dashboard/revenue')).data.data,
    staleTime: 60_000,
  });

  const { data: payData, isLoading: payLoading } = useQuery({
    queryKey: ['dashboard-payments', payPage, paySearch, payStatus],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard/payments', {
        params: { page: payPage + 1, limit, search: paySearch, status: payStatus },
      });
      return res.data.data;
    },
  });

  const { data: activityData, isLoading: actLoading } = useQuery({
    queryKey: ['dashboard-activities'],
    queryFn: async () => (await api.get('/admin/dashboard/activities')).data.data,
    staleTime: 45_000,
  });

  const approve = useMutation({
    mutationFn: (id) => api.patch(`/payments/${id}/approve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-activities'] });
      qc.invalidateQueries({ queryKey: ['dashboard-revenue'] });
      qc.invalidateQueries({ queryKey: ['payments'] });
    },
  });

  const reject = useMutation({
    mutationFn: (id) => api.patch(`/payments/${id}/reject`, { reason: 'Invalid proof' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['dashboard-payments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-activities'] });
    },
  });

  const kpiSpark = (v) => [{ v: v * 0.3 }, { v: v * 0.5 }, { v: v * 0.75 }, { v }];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <Box mb={3}>
        <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={900} letterSpacing={-0.5}>
          Command Center
        </Typography>
        <Typography color="text.secondary" mt={0.5}>
          Kalyani Shooting Academy — strategic overview · {stats?.currentMonth} {stats?.currentYear}
        </Typography>
      </Box>

      <Grid container spacing={2.5} mb={3}>
        {[
          { title: 'Total Students', value: stats?.totalStudents, change: stats?.studentGrowth, gradient: kpiGradients.students, icon: <FaUsers />, delay: 0 },
          { title: 'Pending Payments', value: stats?.pendingPayments, gradient: kpiGradients.pending, icon: <FaClock />, delay: 0.05 },
          { title: 'Approved Payments', value: stats?.approvedPayments, gradient: kpiGradients.approved, icon: <FaCheckCircle />, delay: 0.1 },
          { title: 'Rejected Payments', value: stats?.rejectedPayments, gradient: kpiGradients.rejected, icon: <FaTimesCircle />, delay: 0.15 },
          { title: 'Monthly Collection', value: stats?.monthlyCollection, prefix: '₹', decimals: 0, change: stats?.collectionGrowth, changeLabel: 'vs last month', gradient: kpiGradients.collection, icon: <FaRupeeSign />, delay: 0.2 },
          { title: 'Outstanding Fees', value: stats?.outstandingFees, prefix: '₹', decimals: 0, gradient: kpiGradients.outstanding, icon: <FaExclamationTriangle />, delay: 0.25 },
          { title: 'Active Students', value: stats?.activeStudents, gradient: kpiGradients.active, icon: <MdOutlineSportsScore />, delay: 0.3 },
          { title: 'Inactive Students', value: stats?.inactiveStudents, gradient: kpiGradients.inactive, icon: <HiUserRemove />, delay: 0.35 },
        ].map((k) => (
          <Grid item xs={12} sm={6} md={3} key={k.title}>
            {statsLoading ? (
              <Skeleton variant="rounded" height={148} sx={{ borderRadius: 3 }} />
            ) : (
              <KpiCard
                {...k}
                spark={kpiSpark(Number(k.value) || 0)}
              />
            )}
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={8}>
          <ChartCard title="Monthly revenue" subtitle="Approved fee collections" loading={revenueLoading}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue?.monthlyRevenue || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFD600" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#FFD600" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="revenue" stroke="#111" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ChartCard title="Payment status" loading={revenueLoading}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenue?.paymentStatus || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {(revenue?.paymentStatus || []).map((e, i) => (
                    <Cell key={i} fill={e.color || '#FFD600'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Student growth" subtitle="New registrations" loading={revenueLoading} height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue?.studentGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="students" fill="#111" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Daily payment activity" subtitle="Last 30 days" loading={revenueLoading} height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="submissions" stroke="#111" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="approved" stroke="#2e7d32" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Fee collection trend" loading={revenueLoading} height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue?.feeCollectionTrend || []}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Area type="monotone" dataKey="collected" stroke="#FFD600" fill="rgba(255,214,0,0.35)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <ChartCard title="Training sessions" subtitle="Monthly score sessions" loading={revenueLoading} height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue?.sessionActivity || []}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#FFD600" stroke="#111" strokeWidth={1} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={8}>
          <RecentPaymentsTable
            rows={payData?.payments || []}
            loading={payLoading}
            page={payPage}
            total={payData?.pagination?.total || 0}
            limit={limit}
            onPageChange={setPayPage}
            onSearch={(q) => { setPaySearch(q); setPayPage(0); }}
            onStatusFilter={(s) => { setPayStatus(s); setPayPage(0); }}
            statusFilter={payStatus}
          />
        </Grid>
        <Grid item xs={12} lg={4}>
          <PendingApprovals
            items={payData?.pendingApprovals || []}
            loading={payLoading}
            pending={approve.isPending || reject.isPending}
            onApprove={(id) => approve.mutate(id)}
            onReject={(id) => reject.mutate(id)}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={10}>
        <Grid item xs={12} md={7}>
          <ActivityTimeline activities={activityData?.activities || []} loading={actLoading} />
        </Grid>
        <Grid item xs={12} md={5}>
          <TopShooters shooters={revenue?.topShooters || []} loading={revenueLoading} />
        </Grid>
      </Grid>

      <QuickActionsFab />
    </Box>
  );
}
