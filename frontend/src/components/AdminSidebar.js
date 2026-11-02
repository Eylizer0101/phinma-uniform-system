// src/components/AdminSidebar.js
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BarChart as AnalyticsIcon,
  People as PeopleIcon,
  RequestQuote as RequestIcon,
  Archive as ArchiveIcon,
  Notifications as NotificationsIcon,
  Menu as MenuIcon, Close as CloseIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const goTo = (path) => { navigate(path); setMobileOpen(false); };
  const location = useLocation();
  const { logout } = useAuth();
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const mainMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/admin/analytics' },
  ];

  const managementMenu = [
    { text: 'Users Management', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Requests', icon: <RequestIcon />, path: '/admin/requests' },
    { text: 'Archive', icon: <ArchiveIcon />, path: '/admin/archive' },
  
  ];

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutDialogOpen(false);
    logout();
    navigate('/');
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      {isMobile && <Box sx={{height: 60, position:"fixed", top:0, left:0, right:0, zIndex: theme.zIndex.drawer - 1, bgcolor:"white", display:"flex", alignItems:"center", px:2, borderBottom:"1px solid #e0e0e0"}}><IconButton aria-label="Open admin navigation" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton><Typography sx={{fontWeight:700,ml:1,color:"#20416e"}}>Admin Panel</Typography></Box>}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{keepMounted:true}}
        sx={{
          width: isMobile ? 0 : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            color: '#0e2444ff',
            borderRight: '1px solid #E0E0E0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        {/* TOP SECTION */}
       <Box>
  <Box sx={{ p: 2, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Typography
      variant="h6"
      sx={{ fontWeight: 'bold', color: '#20416eff', letterSpacing: 0.5, marginRight: '20px' }}
    >
      Admin Panel
    </Typography>
    <img 
      src="/images/navbarbg.png" 
      alt="Admin Logo" 
      style={{ 
        height: '60px',
        width: 'auto',
        objectFit: 'contain'
      }}
    />
  </Box>

          {/* MAIN SECTION */}
          <Typography
            sx={{ ml: 2, mt: 1, mb: 0.5, fontSize: 12, color: '#777' }}
          >
            MAIN
          </Typography>
          <List>
            {mainMenu.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => goTo(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#E3F2FD',
                      borderLeft: '4px solid #3a7bd5',
                    },
                    '&:hover': {
                      backgroundColor: '#EAF4FE',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#3a7bd5', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* MANAGEMENT SECTION */}
          <Typography
            sx={{ ml: 2, mt: 1, mb: 0.5, fontSize: 12, color: '#777' }}
          >
            MANAGEMENT
          </Typography>
          <List>
            {managementMenu.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => goTo(item.path)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: '#E3F2FD',
                      borderLeft: '4px solid #3a7bd5',
                    },
                    '&:hover': {
                      backgroundColor: '#EAF4FE',
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: '#3a7bd5', minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* BOTTOM SECTION */}
        <Box sx={{ borderTop: '1px solid #E0E0E0', p: 2 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogoutClick}
                sx={{
                  background: 'linear-gradient(90deg, #3a7bd5, #3a7bd5)',
                  color: '#fff',
                  borderRadius: 1,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #3a7bd5, #3a7bd5)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>

          {/* PROFILE SECTION */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Avatar
              alt="Admin"
              src="/images/ava.jpg"
              sx={{ width: 40, height: 40, mr: 1 }}
            />
            <Box>
              <Typography
                sx={{ fontSize: 14, fontWeight: 600, color: '#3a7bd5' }}
              >
                Hello Justine
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#777' }}>ADMIN</Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminSidebar;