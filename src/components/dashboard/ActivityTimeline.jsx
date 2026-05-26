import { Box, Typography, Card, CardContent, Stack, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const iconFor = (type) => {
  if (type?.includes('payment')) return <PaymentIcon fontSize="small" />;
  if (type?.includes('student')) return <PersonAddIcon fontSize="small" />;
  return <AdminPanelSettingsIcon fontSize="small" />;
};

const formatTime = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

export default function ActivityTimeline({ activities = [], loading }) {
  if (loading) return <Skeleton variant="rounded" height={360} />;

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ borderRadius: 3, height: '100%' }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={800} mb={2}>Recent activity</Typography>
        <Stack spacing={0} sx={{ maxHeight: 400, overflow: 'auto' }}>
          {activities.map((a, i) => (
            <Box
              key={a.id}
              display="flex"
              gap={2}
              py={1.5}
              sx={{
                borderLeft: '2px solid #FFD600',
                pl: 2,
                ml: 1,
                borderBottom: i < activities.length - 1 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  bgcolor: '#111',
                  color: '#FFD600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {iconFor(a.type)}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>{a.title}</Typography>
                <Typography variant="caption" color="text.secondary">{a.subtitle}</Typography>
                <Typography variant="caption" display="block" color="text.disabled" mt={0.25}>
                  {formatTime(a.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))}
          {activities.length === 0 && (
            <Typography color="text.secondary" py={2}>No recent activity</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
