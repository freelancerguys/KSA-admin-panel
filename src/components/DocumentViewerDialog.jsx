import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function DocumentViewerDialog({ open, onClose, title, url }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !url) {
      setPreviewUrl('');
      setError('');
      setLoading(false);
      return undefined;
    }

    let objectUrl = '';
    let cancelled = false;

    const loadPreview = async () => {
      setLoading(true);
      setError('');
      setPreviewUrl('');

      try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        if (cancelled) return;

        if (blob.type && blob.type !== 'application/pdf' && !blob.type.includes('pdf')) {
          throw new Error('Unsupported file type');
        }

        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setPreviewUrl(url);
          setError('Inline preview unavailable. Use Open in New Tab if the document does not appear.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [open, url]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      <DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
        {title || 'Document'}
        <IconButton
          aria-label="Close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: { xs: '70vh', md: '80vh' }, bgcolor: '#525659' }}>
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        ) : previewUrl ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {error && (
              <Alert severity="warning" sx={{ borderRadius: 0 }}>
                {error}
              </Alert>
            )}
            <Box
              component="iframe"
              src={`${previewUrl}#toolbar=1&navpanes=0`}
              title={title || 'Document preview'}
              sx={{ flex: 1, width: '100%', border: 0, bgcolor: '#525659' }}
            />
          </Box>
        ) : (
          <Typography color="text.secondary" p={3}>
            Document not available.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose}>Close</Button>
        {url && (
          <Button href={url} target="_blank" rel="noopener noreferrer" startIcon={<OpenInNewIcon />}>
            Open in New Tab
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
