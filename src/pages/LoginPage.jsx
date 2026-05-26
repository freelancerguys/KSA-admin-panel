import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', {
        identifier: identifier.trim().toLowerCase(),
        password,
        portal: 'admin',
      });
      const data = res.data.data;
      if (data.user.role !== 'admin') {
        setError('Admin credentials required');
        return;
      }
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="background.default">
      <Box sx={{ bgcolor: '#111', p: 2, borderRadius: 2, mb: 3 }}>
        <Logo height={72} />
      </Box>
      <Paper sx={{ p: 4, width: 400, borderTop: '4px solid', borderColor: 'primary.main' }}>
        <Typography variant="h5" fontWeight={800} textAlign="center" mb={3}>Admin Login</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} margin="normal" />
          <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 3 }}>Login</Button>
        </form>
      </Paper>
    </Box>
  );
}
