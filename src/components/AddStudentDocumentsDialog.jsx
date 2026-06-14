import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Box,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const MAX_PDF_BYTES = 1 * 1024 * 1024;

function validatePdf(file) {
  if (!file) return 'Please select a PDF file.';
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Only PDF format is allowed.';
  if (file.size > MAX_PDF_BYTES) return 'Each document must be smaller than 1 MB.';
  return '';
}

export default function AddStudentDocumentsDialog({ open, onClose, onUpload, uploading }) {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setFiles([]);
      setError('');
    }
  }, [open]);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = '';
    if (!selected.length) return;

    const valid = [];
    const errors = [];

    selected.forEach((file) => {
      const msg = validatePdf(file);
      if (msg) errors.push(`${file.name}: ${msg}`);
      else valid.push({ file, name: file.name.replace(/\.pdf$/i, ''), type: 'certificate' });
    });

    if (errors.length) setError(errors.join(' '));
    else setError('');

    if (valid.length) setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!files.length) {
      setError('Please add at least one PDF document.');
      return;
    }
    onUpload(files);
  };

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Student Documents</DialogTitle>
      <DialogContent>
        <Stack spacing={2} pt={0.5}>
          <Alert severity="info" icon={<PictureAsPdfIcon fontSize="inherit" />}>
            Upload PDF files only. Maximum size per file: <strong>1 MB</strong>.
          </Alert>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Button component="label" variant="outlined" startIcon={<PictureAsPdfIcon />} disabled={uploading}>
            Choose PDF Files
            <input type="file" hidden multiple accept="application/pdf,.pdf" onChange={handleFileChange} />
          </Button>

          {files.length > 0 && (
            <Stack spacing={1}>
              {files.map((doc, index) => (
                <Box
                  key={`${doc.file.name}-${index}`}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                  px={1.5}
                  py={1}
                  border="1px solid"
                  borderColor="divider"
                  borderRadius={2}
                >
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {doc.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(doc.file.size / 1024).toFixed(0)} KB
                    </Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => removeFile(index)} disabled={uploading}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!files.length || uploading}
          startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {uploading ? 'Uploading…' : `Upload ${files.length || ''} Document${files.length === 1 ? '' : 's'}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
