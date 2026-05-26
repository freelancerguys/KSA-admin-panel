import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'light') =>
  createTheme({
    palette: {
      mode,
      primary: { main: '#FFD600', contrastText: '#111' },
      secondary: { main: '#111111', contrastText: '#FFD600' },
      background: mode === 'dark' ? { default: '#0f0f0f', paper: '#1a1a1a' } : { default: '#f4f5f7', paper: '#fff' },
    },
    typography: { fontFamily: '"Inter", sans-serif' },
    shape: { borderRadius: 10 },
    components: {
      MuiDialog: {
        styleOverrides: {
          paper: { margin: 16, width: 'calc(100% - 32px)', maxWidth: '100%' },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              backgroundColor: '#FFD600',
              color: '#111111',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#e6c200', color: '#111111' },
              '&.Mui-disabled': { backgroundColor: '#EFEFEB', color: '#5C5C5C' },
            },
          },
          {
            props: { variant: 'contained', color: 'secondary' },
            style: {
              backgroundColor: '#111111',
              color: '#FFD600',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#2a2a2a', color: '#FFD600' },
              '&.Mui-disabled': { backgroundColor: 'rgba(17,17,17,0.08)', color: '#5C5C5C' },
            },
          },
          {
            props: { variant: 'outlined' },
            style: {
              borderColor: '#111111',
              color: '#111111',
              '&:hover': { borderColor: '#111111', backgroundColor: 'rgba(255,214,0,0.18)' },
            },
          },
        ],
      },
    },
  });
