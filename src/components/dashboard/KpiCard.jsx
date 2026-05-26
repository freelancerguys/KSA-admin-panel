import { Box, Typography, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

export default function KpiCard({
  title,
  value = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  changeLabel = 'vs last period',
  gradient,
  icon,
  spark = [],
  delay = 0,
}) {
  const isUp = change >= 0;
  const sparkData = spark.length ? spark : [{ v: 0 }, { v: value * 0.4 }, { v: value * 0.7 }, { v: value }];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        background: gradient,
        color: '#fff',
        p: 2.5,
        minHeight: 148,
        boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
        cursor: 'default',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" position="relative" zIndex={1}>
        <Box>
          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, lineHeight: 1.2 }}>
            {prefix}
            <CountUp end={Number(value) || 0} decimals={decimals} duration={1.8} separator="," />
            {suffix}
          </Typography>
          {change !== undefined && change !== null && (
            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
              {isUp ? <TrendingUpIcon sx={{ fontSize: 16 }} /> : <TrendingDownIcon sx={{ fontSize: 16 }} />}
              <Typography variant="caption" fontWeight={700}>
                {isUp ? '+' : ''}
                {change}%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {changeLabel}
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha('#fff', 0.2),
            fontSize: 26,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Box sx={{ height: 44, mt: 1.5, opacity: 0.55 }} position="relative" zIndex={1}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <Area type="monotone" dataKey="v" stroke="#fff" fill="rgba(255,255,255,0.25)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
