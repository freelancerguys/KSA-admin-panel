import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, user, refreshToken, setSession, logout } = useAuthStore();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      if (!refreshToken && !isAuthenticated) {
        if (!cancelled) setBootstrapped(true);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        const u = res.data.data.user;
        if (u.role !== 'admin') throw new Error('not admin');
        if (!cancelled) {
          setSession({
            id: u._id,
            email: u.email,
            phone: u.phone,
            role: u.role,
          });
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setBootstrapped(true);
      }
    };

    validateSession();
    return () => {
      cancelled = true;
    };
  }, [logout, setSession, refreshToken, isAuthenticated]);

  if (!bootstrapped) {
    return (
      <Box minHeight="40vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}
