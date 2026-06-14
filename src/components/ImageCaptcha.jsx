import { useCallback, useEffect, useState } from 'react';
import {
  Box, CircularProgress, IconButton, TextField, Typography, Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import { api } from '../api/client';

const primary = '#FFD600';
const secondary = '#111111';
const surface = '#F7F7F5';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: surface,
    transition: 'box-shadow 0.2s ease, background-color 0.2s ease',
    '& fieldset': { borderColor: 'rgba(17,17,17,0.1)' },
    '&:hover fieldset': { borderColor: 'rgba(17,17,17,0.22)' },
    '&.Mui-focused': {
      bgcolor: '#fff',
      boxShadow: '0 0 0 3px rgba(255,214,0,0.18)',
      '& fieldset': { borderColor: primary },
    },
  },
};

export default function ImageCaptcha({ captchaKey, captchaId, onCaptchaId, value, onChange }) {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadCaptcha = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/captcha');
      setImage(data.data.image);
      onCaptchaId(data.data.captchaId);
      onChange('');
    } catch {
      setImage('');
      onCaptchaId('');
    } finally {
      setLoading(false);
    }
  }, [onCaptchaId, onChange]);

  useEffect(() => {
    loadCaptcha();
  }, [captchaKey, loadCaptcha]);

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" alignItems="center" spacing={0.75} mb={1}>
        <SecurityIcon sx={{ fontSize: 16, color: primary }} />
        <Typography variant="caption" fontWeight={600} color="text.secondary" letterSpacing={0.3}>
          Security verification
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          borderRadius: 2.5,
          overflow: 'hidden',
          border: `1.5px solid rgba(255,214,0,0.4)`,
          boxShadow: '0 2px 8px rgba(255,214,0,0.12)',
        }}
      >
        <Box
          sx={{
            flex: 1,
            bgcolor: '#efefef',
            minHeight: 54,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <CircularProgress size={22} sx={{ color: secondary }} />
          ) : (
            <Box
              component="img"
              src={image}
              alt="Captcha"
              sx={{ width: '100%', height: 54, objectFit: 'cover', display: 'block' }}
            />
          )}
        </Box>
        <IconButton
          type="button"
          onClick={loadCaptcha}
          aria-label="Refresh captcha"
          sx={{
            bgcolor: secondary,
            color: primary,
            borderRadius: 0,
            width: 52,
            flexShrink: 0,
            transition: 'background-color 0.2s ease',
            '&:hover': { bgcolor: '#2a2a2a', color: primary },
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <TextField
        fullWidth
        size="small"
        label="Captcha *"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        margin="normal"
        autoComplete="off"
        sx={{ ...fieldSx, mt: 1.5 }}
        inputProps={{ maxLength: 6 }}
      />

      {!captchaId && !loading && (
        <Typography variant="caption" color="error" display="block" mt={0.5}>
          Could not load captcha. Click refresh to try again.
        </Typography>
      )}
    </Box>
  );
}
