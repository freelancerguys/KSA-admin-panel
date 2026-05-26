import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { api } from '../api/client';

export default function StudentBulkImportDialog({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const qc = useQueryClient();

  const downloadTemplate = async () => {
    const res = await api.get('/students/bulk-import/template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'KSA_Students_Import_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post('/students/bulk-import', fd);
    },
    onSuccess: (res) => {
      setResult(res.data.data);
      qc.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 800 }}>Bulk import students (CSV)</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Upload a CSV with personal details, WB/NRAI shooter IDs, and fee settings. Required columns:
          {' '}
          <strong>fullName, email, phone, studentId</strong>.
        </Typography>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadTemplate}
          sx={{ mb: 2 }}
        >
          Download CSV template
        </Button>

        <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ mb: 2, ml: 1 }}>
          Choose CSV file
          <input
            type="file"
            hidden
            accept=".csv,text/csv"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setResult(null);
            }}
          />
        </Button>

        {file && (
          <Typography variant="body2" mb={2}>
            Selected: <strong>{file.name}</strong>
          </Typography>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          Default password is <strong>Student@123</strong> unless you set a password column. Use
          isCustomFeeEnabled (true/false), customMonthlyFee, feeDiscount, feeDueDay for fees.
        </Alert>

        {importMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {importMutation.error?.response?.data?.message || 'Import failed'}
          </Alert>
        )}

        {result && (
          <Box>
            <Alert severity={result.failed?.length ? 'warning' : 'success'} sx={{ mb: 2 }}>
              Successfully imported <strong>{result.created}</strong> student(s).
              {result.failed?.length > 0 && (
                <>
                  {' '}
                  <strong>{result.failed.length}</strong> row(s) failed.
                </>
              )}
            </Alert>

            {result.failed?.length > 0 && (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Row</TableCell>
                      <TableCell>Student ID</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Error</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.failed.map((f) => (
                      <TableRow key={`${f.row}-${f.email}`}>
                        <TableCell>{f.row}</TableCell>
                        <TableCell>{f.studentId || '—'}</TableCell>
                        <TableCell>{f.email || '—'}</TableCell>
                        <TableCell>{f.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose}>{result ? 'Close' : 'Cancel'}</Button>
        <Button
          variant="contained"
          disabled={!file || importMutation.isPending}
          onClick={() => importMutation.mutate()}
        >
          {importMutation.isPending ? 'Importing…' : 'Import students'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
