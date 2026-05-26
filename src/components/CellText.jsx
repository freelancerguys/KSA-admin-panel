import { Tooltip, Typography } from '@mui/material';

export default function CellText({ value, maxWidth = 220 }) {
  const text = value ?? '—';
  return (
    <Tooltip title={String(text)} placement="top-start">
      <Typography
        variant="body2"
        noWrap
        sx={{ maxWidth, width: '100%' }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
}
