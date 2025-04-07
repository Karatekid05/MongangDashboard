import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import HelpIcon from '@mui/icons-material/Help';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Gangs', icon: <GroupsIcon />, path: '/gangs' },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Leaderboard', icon: <EmojiEventsIcon />, path: '/leaderboard' },
  { text: 'Activity', icon: <HistoryIcon />, path: '/activity' },
];

const Layout = ({ toggleTheme, isDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: [1] }}>
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'text.primary' }}>
          <Avatar
            src="/logo.png"
            alt="Mongang"
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          <Typography variant="h6" noWrap component="div">
            Mongang
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle}>
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={toggleTheme}>
            <ListItemIcon>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText primary={isDarkMode ? "Light Mode" : "Dark Mode"} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/help">
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          width: { md: drawerOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%' },
          ml: { md: drawerOpen ? `${DRAWER_WIDTH}px` : 0 },
          transition: theme.transitions.create(['width', 'margin-left'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          {(!drawerOpen || isMobile) && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Mongang Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer - Mobile */}
      <Drawer
        variant="temporary"
        open={isMobile && drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer - Desktop */}
      <Drawer
        variant="persistent"
        open={drawerOpen && !isMobile}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          width: drawerOpen ? DRAWER_WIDTH : 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: '100%',
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Toolbar /> {/* Spacing to account for AppBar */}
        <Box sx={{
          py: 3,
          px: 0,
          width: '100%'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 