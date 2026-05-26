import { Box, Typography, Card, CardContent, Avatar, Stack, Skeleton, Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { motion } from 'framer-motion';
import { getUploadUrl } from '../../api/client';

export default function TopShooters({ shooters = [], loading }) {
  if (loading) return <Skeleton variant="rounded" height={320} />;

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ borderRadius: 3, height: '100%', background: 'linear-gradient(180deg, #111 0%, #1e1e1e 100%)', color: '#fff' }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <EmojiEventsIcon sx={{ color: '#FFD600' }} />
          <Typography variant="h6" fontWeight={800}>Top performers</Typography>
        </Box>
        <Stack spacing={1.5}>
          {shooters.map((s) => (
            <Box
              key={s.studentId + s.rank}
              display="flex"
              alignItems="center"
              gap={2}
              p={1.5}
              borderRadius={2}
              sx={{ bgcolor: 'rgba(255,255,255,0.06)' }}
            >
              <Chip label={`#${s.rank}`} size="small" sx={{ bgcolor: '#FFD600', color: '#111', fontWeight: 800 }} />
              <Avatar src={s.photo ? getUploadUrl(s.photo) : undefined} sx={{ width: 40, height: 40 }} />
              <Box flex={1}>
                <Typography fontWeight={700} variant="body2">{s.fullName}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>{s.studentId}</Typography>
              </Box>
              <Typography fontWeight={800} sx={{ color: '#FFD600' }}>{s.averageScore}</Typography>
            </Box>
          ))}
          {shooters.length === 0 && (
            <Typography sx={{ opacity: 0.7 }} py={2}>Score data will appear as students log sessions.</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
