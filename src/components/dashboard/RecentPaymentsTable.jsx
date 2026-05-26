import { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, TablePagination, Skeleton, MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';

const statusColor = { pending: 'warning', approved: 'success', rejected: 'error' };

export default function RecentPaymentsTable({
  rows = [],
  loading,
  page,
  total,
  limit,
  onPageChange,
  onSearch,
  onStatusFilter,
  statusFilter,
}) {
  const [search, setSearch] = useState('');

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ borderRadius: 3 }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={800} mb={2}>Recent payments</Typography>
        <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
          <TextField
            size="small"
            placeholder="Search student or KSA ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch(search)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 220, flex: 1 }}
          />
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.target.value)}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Typography
            component="button"
            variant="body2"
            onClick={() => onSearch(search)}
            sx={{ border: 'none', bgcolor: 'transparent', cursor: 'pointer', fontWeight: 700, color: 'secondary.main' }}
          >
            Search
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="rounded" height={280} />
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>KSA ID</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Transaction ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r._id} hover>
                      <TableCell>{r.studentName}</TableCell>
                      <TableCell>{r.ksaId}</TableCell>
                      <TableCell>{formatCurrency(r.amount)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={r.status} color={statusColor[r.status]} sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>
                        {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-IN') : '—'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.transactionId || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => onPageChange(p)}
              rowsPerPage={limit}
              rowsPerPageOptions={[limit]}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
