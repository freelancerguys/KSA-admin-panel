import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { motion } from 'framer-motion';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import ImageCaptcha from '../components/ImageCaptcha';
import Logo from '../components/Logo';

const colors = {
  primary: '#FFD600',
  secondary: '#111111',
  background: '#FFFFFF',
  surface: '#F7F7F5',
  textMuted: '#5C5C5C',
  primaryMuted: 'rgba(255,214,0,0.18)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: colors.surface,
    transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
    '& fieldset': { borderColor: 'rgba(17,17,17,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(17,17,17,0.22)' },
    '&.Mui-focused': {
      bgcolor: colors.background,
      boxShadow: `0 0 0 3px ${colors.primaryMuted}`,
      '& fieldset': { borderColor: colors.primary },
    },
  },
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const resetCaptcha = useCallback(() => {
    setCaptchaAnswer('');
    setCaptchaId('');
    setCaptchaKey((k) => k + 1);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!captchaId || !captchaAnswer.trim()) {
      setError('Please enter the captcha');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/login', {
        identifier: identifier.trim().toLowerCase(),
        password,
        portal: 'admin',
        captchaId,
        captchaAnswer: captchaAnswer.trim(),
      });
      const data = res.data.data;
      if (data.user.role !== 'admin') {
        setError('Admin credentials required');
        resetCaptcha();
        return;
      }
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      resetCaptcha();
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = captchaId && captchaAnswer.trim() && identifier.trim() && password;

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 3 },
        position: 'relative',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse 85% 55% at 50% -10%, rgba(255,214,0,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 45% 35% at 100% 100%, rgba(255,214,0,0.06) 0%, transparent 50%),
          ${colors.secondary}
        `,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '-10%',
          right: '-15%',
          width: { xs: 200, sm: 280 },
          height: { xs: 200, sm: 280 },
          borderRadius: '50%',
          border: '1px solid rgba(255,214,0,0.1)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: '-12%',
          left: '-12%',
          width: { xs: 160, sm: 220 },
          height: { xs: 160, sm: 220 },
          borderRadius: '50%',
          border: '1px solid rgba(255,214,0,0.08)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="xs" disableGutters sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box display="flex" justifyContent="center" mb={{ xs: 2.5, sm: 3 }}>
            <Box
              sx={{
                bgcolor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                px: { xs: 2.5, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                border: '1px solid rgba(255,214,0,0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              }}
            >
              <Logo height={isMobile ? 64 : 72} />
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: { xs: 3, sm: 4 },
              borderTop: `4px solid ${colors.primary}`,
              bgcolor: colors.background,
              boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
              width: '100%',
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            <Stack spacing={0.5} alignItems="center" mb={2.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AdminPanelSettingsOutlinedIcon sx={{ color: colors.secondary, fontSize: 26 }} />
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem' }, letterSpacing: '-0.02em' }}
                >
                  Admin Login
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 300, lineHeight: 1.5 }}>
                Secure access for academy administrators
              </Typography>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5, '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: colors.textMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: colors.textMuted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <ImageCaptcha
                captchaKey={captchaKey}
                captchaId={captchaId}
                onCaptchaId={setCaptchaId}
                value={captchaAnswer}
                onChange={setCaptchaAnswer}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting || !canSubmit}
                sx={{
                  mt: 2.5,
                  py: 1.45,
                  borderRadius: 2.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: canSubmit ? '0 4px 16px rgba(255,214,0,0.35)' : 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover:not(.Mui-disabled)': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 24px rgba(255,214,0,0.45)',
                  },
                }}
              >
                {submitting ? 'Signing in...' : 'Login'}
              </Button>
            </Box>
          </Paper>

          <Typography
            variant="caption"
            textAlign="center"
            display="block"
            sx={{ mt: 2.5, color: 'rgba(255,255,255,0.45)' }}
          >
            Authorized administrators only · All login attempts are monitored
          </Typography>
        </motion.div>
      </Container>
    </Box>
  );
}
