import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
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
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import Logo from '../components/Logo';

const DRAWER_WIDTH = 240;

const nav = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon fontSize="small" />, end: true },
  { to: '/students', label: 'Students', icon: <PeopleIcon fontSize="small" /> },
  { to: '/fees', label: 'Payment Settings', icon: <MonetizationOnIcon fontSize="small" /> },
  { to: '/payments', label: 'Payments', icon: <PaymentIcon fontSize="small" /> },
  { to: '/blogs', label: 'Blogs', icon: <ArticleIcon fontSize="small" /> },
  { to: '/activities', label: 'Activities', icon: <EventIcon fontSize="small" /> },
  { to: '/gallery', label: 'Gallery', icon: <PhotoLibraryIcon fontSize="small" /> },
  { to: '/achievements', label: 'Achievements', icon: <EmojiEventsIcon fontSize="small" /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
];

const roleLabel = (role) => {
  if (role === 'admin') return 'Administrator';
  if (role === 'student') return 'Student';
  return role || 'User';
};

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

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
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          py: 1.5,
          px: 1,
          bgcolor: 'secondary.main',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Logo to="/" height={48} />
      </Box>

      <List
        dense
        disablePadding
        sx={{
          py: 1,
          px: 0.5,
          flex: '0 0 auto',
          overflow: 'visible',
        }}
      >
        {nav.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            sx={{
              py: 0.75,
              px: 1.5,
              borderRadius: 1.5,
              mb: 0.25,
              minHeight: 40,
              '&.active': {
                bgcolor: 'primary.main',
                color: 'secondary.main',
                fontWeight: 600,
                '& .MuiListItemIcon-root': { color: 'secondary.main' },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Admin navigation"
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
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
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'primary.main',
            color: 'secondary.main',
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
          }}
        >
          <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" fontWeight={700} noWrap sx={{ flexGrow: { xs: 1, md: 0 }, mr: { md: 3 } }}>
              Admin Panel
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 0.75, sm: 1.5 },
                ml: 'auto',
                flexShrink: 0,
              }}
            >
              <Chip
                label={roleLabel(user?.role)}
                size="small"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 24,
                }}
              />
              <Typography
                variant="body2"
                noWrap
                sx={{
                  maxWidth: { xs: 100, sm: 200 },
                  display: { xs: 'none', md: 'block' },
                  fontWeight: 500,
                }}
              >
                {user?.email}
              </Typography>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleLogout}
                sx={{
                  fontWeight: 600,
                  px: { xs: 1.5, sm: 2 },
                  minWidth: { xs: 'auto', sm: 100 },
                  '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Logout
                </Box>
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5, md: 3 },
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', minWidth: 0 }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
