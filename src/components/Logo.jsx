import { Box } from '@mui/material';
import { Link } from 'react-router-dom';

export const LOGO_SRC = '/ksalogo.png';

export default function Logo({ height = 48, to, sx = {}, alt = 'Kalyani Shooting Academy' }) {
  const img = (
    <Box
      component="img"
      src={LOGO_SRC}
      alt={alt}
      sx={{
        height,
        width: 'auto',
        maxWidth: height * 4,
        objectFit: 'contain',
        display: 'block',
        ...sx,
      }}
    />
  );

  if (to) {
    return (
      <Box component={Link} to={to} sx={{ display: 'inline-flex', textDecoration: 'none', lineHeight: 0 }}>
        {img}
      </Box>
    );
  }

  return img;
}
