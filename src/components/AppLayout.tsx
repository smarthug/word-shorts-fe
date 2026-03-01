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
import MenuIcon from '@mui/icons-material/Menu';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import StyleIcon from '@mui/icons-material/Style';
import QuizIcon from '@mui/icons-material/Quiz';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';

const tabs = [
  { label: 'Deck', icon: <StyleIcon />, path: '/deck' },
  { label: 'Shorts', icon: <OndemandVideoIcon />, path: '/' },
  { label: 'Quiz', icon: <QuizIcon />, path: '/quiz' },
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
