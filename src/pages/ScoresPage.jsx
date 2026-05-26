import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Skeleton,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { api, getUploadUrl } from '../api/client';
import PageShell from '../components/PageShell';
import {
  sumSeriesShots,
  sumSessionSeries,
  seriesShotCountLabel,
  formatShotList,
  MAX_SHOT_SCORE,
} from '../utils/scores';

function StudentScoreDetail({ studentId, onBack }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-student-scores', studentId],
    queryFn: async () => (await api.get(`/admin/scores/students/${studentId}`)).data.data,
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={6} md={3} key={i}>
              <Skeleton variant="rounded" height={80} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rounded" height={200} sx={{ mt: 2 }} />
      </Box>
    );
  }

  const { student, sessions = [], stats = {}, analytics = {} } = data || {};

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
        Back to all students
      </Button>

      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Avatar
          src={student?.photo ? getUploadUrl(student.photo) : undefined}
          sx={{ width: 56, height: 56, bgcolor: '#111', color: '#FFD600', fontWeight: 800 }}
        >
          {student?.fullName?.[0]}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800}>{student?.fullName}</Typography>
          <Typography color="text.secondary">
            {student?.studentId}
            {student?.wbShooterId ? ` · WB: ${student.wbShooterId}` : ''}
            {student?.nraiShooterId ? ` · NRAI: ${student.nraiShooterId}` : ''}
          </Typography>
          <Chip
            size="small"
            label={student?.isActive ? 'Active' : 'Inactive'}
            color={student?.isActive ? 'success' : 'default'}
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Shots', value: stats.totalShots },
          { label: 'Average', value: stats.average },
          { label: 'Best', value: stats.best },
          { label: 'Sessions', value: stats.sessions },
        ].map((s) => (
          <Grid item xs={6} md={3} key={s.label}>
            <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h5" fontWeight={800}>{s.value ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>Weekly progress</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.weekly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, MAX_SHOT_SCORE]} width={32} />
                    <Tooltip />
                    <Line type="monotone" dataKey="average" stroke="#FFD600" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Typography fontWeight={700} mb={2}>Monthly accuracy</Typography>
              <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthly || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, MAX_SHOT_SCORE]} width={32} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#111" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={800} mb={2}>Session history</Typography>
      {sessions.length === 0 ? (
        <Typography color="text.secondary">No score sessions logged yet.</Typography>
      ) : (
        sessions.map((session) => (
          <Card key={session._id} sx={{ mb: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography fontWeight={800} mb={1.5}>
                {new Date(session.sessionDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Typography>
              {(session.series || []).map((s, idx) => (
                <Box
                  key={idx}
                  sx={{
                    py: 1,
                    px: 1.5,
                    mb: 1,
                    borderRadius: 1.5,
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>{s.name || `Series ${idx + 1}`}</Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Shots: {formatShotList(s.shots)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {seriesShotCountLabel(s.shots)} · series total: <strong>{sumSeriesShots(s.shots)}</strong>
                  </Typography>
                </Box>
              ))}
              <Typography variant="body1" fontWeight={800} sx={{ color: '#111', mt: 1 }}>
                Session total (all series): {sumSessionSeries(session.series)}
              </Typography>
              {session.notes && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Notes: {session.notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
}

export default function ScoresPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['admin-scores-students', query],
    queryFn: async () => (await api.get('/admin/scores/students', { params: { search: query } })).data.data,
    enabled: !selectedId,
  });

  if (selectedId) {
    return (
      <PageShell title="Student scores" subtitle="Full score history — same data as student portal">
        <StudentScoreDetail studentId={selectedId} onBack={() => setSelectedId(null)} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Scores" subtitle="View shooting scores for all academy students">
      <TextField
        size="small"
        placeholder="Search by name or KSA ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && setQuery(search)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, maxWidth: 360 }}
      />
      <Button variant="outlined" size="small" onClick={() => setQuery(search)} sx={{ ml: 1, mb: 3, verticalAlign: 'top' }}>
        Search
      </Button>

      {isLoading ? (
        <Skeleton variant="rounded" height={400} />
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell>Student</TableCell>
                <TableCell>KSA ID</TableCell>
                <TableCell align="center">Sessions</TableCell>
                <TableCell align="center">Total shots</TableCell>
                <TableCell align="center">Average</TableCell>
                <TableCell align="center">Best</TableCell>
                <TableCell>Last session</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No students found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((row) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          src={row.photo ? getUploadUrl(row.photo) : undefined}
                          sx={{ width: 36, height: 36, bgcolor: '#111', color: '#FFD600', fontSize: 14 }}
                        >
                          {row.fullName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={600}>{row.fullName}</Typography>
                          {!row.isActive && (
                            <Chip label="Inactive" size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{row.studentId}</TableCell>
                    <TableCell align="center">{row.sessions}</TableCell>
                    <TableCell align="center">{row.totalShots}</TableCell>
                    <TableCell align="center">{row.average || '—'}</TableCell>
                    <TableCell align="center">{row.best || '—'}</TableCell>
                    <TableCell>
                      {row.lastSessionDate
                        ? new Date(row.lastSessionDate).toLocaleDateString('en-IN')
                        : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setSelectedId(row._id)}
                      >
                        View scores
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </PageShell>
  );
}
