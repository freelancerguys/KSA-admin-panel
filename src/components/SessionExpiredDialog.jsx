import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function SessionExpiredDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('ksa:session-expired', handler);
    return () => window.removeEventListener('ksa:session-expired', handler);
  }, []);

  return (
    <Dialog open={open}>
      <DialogTitle>Session expired</DialogTitle>
      <DialogContent>
        <Typography>Please sign in again to access the admin panel.</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => { setOpen(false); navigate('/login'); }}>
          Go to login
        </Button>
      </DialogActions>
    </Dialog>
  );
}
