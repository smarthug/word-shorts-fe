import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  OndemandVideo as OndemandVideoIcon,
  Style as StyleIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

const tabs = [
  { label: 'Deck', icon: <StyleIcon />, path: '/deck' },
  { label: 'Shorts', icon: <OndemandVideoIcon />, path: '/' },
  { label: 'Checklist', icon: <PlaylistAddCheckIcon />, path: '/checklist' },
];

const drawerItems = [
  { label: '설정', icon: <SettingsIcon /> },
  { label: '통계', icon: <BarChartIcon /> },
  { label: '정보', icon: <InfoIcon /> },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarAnchor, setAvatarAnchor] = useState<null | HTMLElement>(null);

  const currentTab = tabs.findIndex((t) => t.path === location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      {/* AppBar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>

          </Typography>
          <IconButton color="inherit" onClick={(e) => setAvatarAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }}>
          <List>
            {drawerItems.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton onClick={() => setDrawerOpen(false)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Avatar Menu */}
      <Menu
        anchorEl={avatarAnchor}
        open={Boolean(avatarAnchor)}
        onClose={() => setAvatarAnchor(null)}
      >
        <MenuItem onClick={() => setAvatarAnchor(null)}>프로필</MenuItem>
        <MenuItem onClick={() => setAvatarAnchor(null)}>로그아웃</MenuItem>
      </Menu>

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Outlet />
      </Box>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={currentTab === -1 ? 0 : currentTab}
        onChange={(_, newValue) => navigate(tabs[newValue].path)}
        showLabels
        sx={{ width: '100%' }}
      >
        {tabs.map((tab) => (
          <BottomNavigationAction
            key={tab.label}
            label={tab.label}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
