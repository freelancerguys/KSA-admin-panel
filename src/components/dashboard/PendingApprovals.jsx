import {
  Box, Typography, Card, CardContent, Button, Stack, Avatar, Chip, Skeleton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { motion } from 'framer-motion';
import { getUploadUrl } from '../../api/client';
import { formatCurrency } from '../../utils/currency';

export default function PendingApprovals({ items = [], onApprove, onReject, loading, pending }) {
  if (loading) {
    return <Skeleton variant="rounded" height={280} />;
  }

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={800}>Pending approvals</Typography>
          <Chip label={`${items.length} waiting`} color="warning" size="small" />
        </Box>
        {items.length === 0 ? (
          <Typography color="text.secondary" py={4} textAlign="center">No pending payments</Typography>
        ) : (
          <Stack spacing={2}>
            {items.map((p) => (
              <Box
                key={p._id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <Avatar src={p.photo ? getUploadUrl(p.photo) : undefined} sx={{ bgcolor: '#111' }}>
                    {p.studentName?.[0]}
                  </Avatar>
                  <Box flex={1} minWidth={120}>
                    <Typography fontWeight={700}>{p.studentName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {p.studentId} · {formatCurrency(p.amount)} · {p.period}
                    </Typography>
                    {p.proofImage && (
                      <Button size="small" href={getUploadUrl(p.proofImage)} target="_blank" sx={{ mt: 0.5, p: 0 }}>
                        View proof
                      </Button>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      disabled={pending}
                      onClick={() => onApprove(p._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      disabled={pending}
                      onClick={() => onReject(p._id)}
                    >
                      Reject
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
