import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import ArticleIcon from '@mui/icons-material/Article';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import Logo from '../components/Logo';
import NotificationBell from '../components/dashboard/NotificationBell';

const DRAWER_FULL = 248;
const DRAWER_COLLAPSED = 76;

const nav = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/students', label: 'Students', icon: <PeopleIcon /> },
  { to: '/payments', label: 'Payments', icon: <PaymentIcon /> },
  { to: '/fees', label: 'Fees', icon: <MonetizationOnIcon /> },
  { to: '/scores', label: 'Scores', icon: <SportsScoreIcon /> },
  { to: '/blogs', label: 'Blogs', icon: <ArticleIcon /> },
  { to: '/activities', label: 'Activities', icon: <EventIcon /> },
  { to: '/gallery', label: 'Gallery', icon: <PhotoLibraryIcon /> },
  { to: '/achievements', label: 'Achievements', icon: <EmojiEventsIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED : DRAWER_FULL;

  const { data: notifications = [] } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => (await api.get('/admin/dashboard/activities')).data.data.notifications,
    staleTime: 60_000,
  });

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#111', color: '#fff' }}>
      <Box
        sx={{
          py: 2,
          px: collapsed && !isMobile ? 1 : 2,
          display: 'flex',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,214,0,0.15)',
        }}
      >
        <Logo to="/" height={collapsed && !isMobile ? 40 : 52} />
      </Box>

      <List sx={{ flex: 1, py: 1.5, px: 1, overflowY: 'auto' }}>
        {nav.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              minHeight: 48,
              color: 'rgba(255,255,255,0.75)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: 'rgba(255,214,0,0.12)',
                color: '#FFD600',
                boxShadow: '0 0 20px rgba(255,214,0,0.15)',
              },
              '&.active': {
                bgcolor: '#FFD600',
                color: '#111',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(255,214,0,0.35)',
                '& .MuiListItemIcon-root': { color: '#111' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: collapsed && !isMobile ? 0 : 40, color: 'inherit', justifyContent: 'center' }}>
              {item.icon}
            </ListItemIcon>
            {(!collapsed || isMobile) && (
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
            )}
          </ListItemButton>
        ))}
      </List>

      {!isMobile && (
        <Box p={1} borderTop="1px solid rgba(255,255,255,0.08)">
          <IconButton onClick={() => setCollapsed(!collapsed)} sx={{ color: '#FFD600', width: '100%' }}>
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f5f7' }}>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 }, transition: 'width 0.25s' }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              transition: 'width 0.25s',
              boxSizing: 'border-box',
              border: 'none',
              overflow: 'hidden',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          transition: 'width 0.25s',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#fff',
            color: '#111',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" fontWeight={800} noWrap sx={{ flexGrow: { xs: 1, md: 0 } }}>
              KSA Admin
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <NotificationBell notifications={notifications} />

            <Box display="flex" alignItems="center" gap={1.5} ml={1}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#111', color: '#FFD600', fontWeight: 800 }}>
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={700} lineHeight={1.2}>
                  {user?.email?.split('@')[0] || 'Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
              <Tooltip title="Logout">
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                >
                  Logout
                </Button>
              </Tooltip>
              <IconButton color="inherit" onClick={handleLogout} sx={{ display: { xs: 'flex', md: 'none' } }}>
                <LogoutIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component={motion.main}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          sx={{ flexGrow: 1, p: { xs: 2, sm: 2.5, md: 3 }, overflow: 'auto' }}
        >
          <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
