import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconButton,
  Badge,
  Menu,
  Typography,
  Box,
  Divider,
  Tooltip,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function NotificationBell({ notifications = [] }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const open = Boolean(anchor);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-notifications'] });
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return;
    await Promise.all(
      unread.map((n) =>
        api.patch(`/admin/dashboard/notifications/${n.id}/read`, { fingerprint: n.fingerprint })
      )
    );
    invalidate();
  };

  const markReadMutation = useMutation({
    mutationFn: (n) =>
      api.patch(`/admin/dashboard/notifications/${n.id}/read`, { fingerprint: n.fingerprint }),
    onSuccess: invalidate,
  });

  const dismissMutation = useMutation({
    mutationFn: (n) =>
      api.delete(`/admin/dashboard/notifications/${n.id}`, { data: { fingerprint: n.fingerprint } }),
    onSuccess: invalidate,
  });

  const handleOpenLink = (n) => {
    setAnchor(null);
    if (n.link) navigate(n.link);
  };

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)} aria-label="Notifications">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { width: 360, maxHeight: 440 } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box px={2} py={1.25} display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" color="text.secondary">
              {unreadCount} unread
            </Typography>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box px={2} py={2.5}>
            <Typography variant="body2" color="text.secondary">
              All caught up — no new alerts
            </Typography>
          </Box>
        ) : (
          notifications.map((n) => (
            <Box
              key={`${n.id}-${n.fingerprint}`}
              sx={{
                px: 1.5,
                py: 1.25,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: n.read ? 'action.hover' : 'background.paper',
                opacity: n.read ? 0.75 : 1,
                transition: 'background-color 0.2s',
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Box flex={1} minWidth={0}>
                  <Typography
                    variant="body2"
                    fontWeight={n.read ? 500 : 700}
                    lineHeight={1.35}
                    sx={{ pr: 0.5 }}
                  >
                    {n.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
                    {n.message}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.25} flexShrink={0}>
                  {n.link && (
                    <Tooltip title="Open">
                      <IconButton size="small" onClick={() => handleOpenLink(n)} aria-label="Open notification">
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {!n.read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => markReadMutation.mutate(n)}
                        disabled={markReadMutation.isPending}
                        aria-label="Mark as read"
                      >
                        <DoneAllIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => dismissMutation.mutate(n)}
                      disabled={dismissMutation.isPending}
                      aria-label="Delete notification"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          ))
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <MenuItem disabled={unreadCount === 0} onClick={markAllRead}>
              <ListItemIcon>
                <DoneAllIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Mark all as read" />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
