import { useState } from 'react';
import {
  IconButton, Badge, Menu, MenuItem, ListItemText, Typography, Box, Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell({ notifications = [] }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchor);

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Notifications">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)} PaperProps={{ sx: { width: 320, maxHeight: 400 } }}>
        <Box px={2} py={1}>
          <Typography fontWeight={700}>Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <ListItemText primary="All caught up" secondary="No new alerts" />
          </MenuItem>
        ) : (
          notifications.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => {
                setAnchor(null);
                if (n.link) navigate(n.link);
              }}
            >
              <ListItemText primary={n.title} secondary={n.message} />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
