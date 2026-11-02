import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Drawer, List, ListItemButton, ListItemText,
  Toolbar,
  Typography,
  Button,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  CircularProgress,
  Avatar,
  Chip,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Menu as MenuIcon, Close as CloseIcon,
  Notifications as NotificationsIcon,
  CheckCircle as ReadIcon,
  Assignment as RequestIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Done as ApprovedIcon,
  Block as CancelledIcon,
  Clear as ClearIcon,
  HomeOutlined as HomeMenuIcon,
  InfoOutlined as AboutMenuIcon,
  PhoneOutlined as ContactMenuIcon,
  LoginOutlined as LoginMenuIcon,
  PersonAddAltOutlined as RegisterMenuIcon,
  LogoutOutlined as LogoutMenuIcon,
  CheckroomOutlined as UniformMenuIcon,
  FactCheckOutlined as TrackMenuIcon,
  PersonOutline as ProfileMenuIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Notification states
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  // Logout confirmation dialog state
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (user && user.role === 'student') {
      fetchNotifications();
      // Refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await axios.get('/uniform-requests/my-requests');
      const requests = response.data;
      
      const allNotifications = [];
      requests.forEach(request => {
        if (request.notifications && request.notifications.length > 0) {
          request.notifications.forEach(notification => {
            allNotifications.push({
              ...notification,
              requestId: request._id,
              uniformType: request.uniform,
              requestStatus: request.status
            });
          });
        }
      });
      
      allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
    // Refresh notifications when opening the menu
    fetchNotifications();
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleMarkAsRead = async (notificationId, requestId) => {
    try {
      await axios.patch(`/uniform-requests/${requestId}/notifications/${notificationId}/read`);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      navigate(`/request-details/${requestId}`);
      handleNotificationClose();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      for (const notification of unreadNotifications) {
        await axios.patch(`/uniform-requests/${notification.requestId}/notifications/${notification._id}/read`);
      }
      
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type, status) => {
    if (type === 'status_update') {
      switch (status) {
        case 'approved':
          return <ApprovedIcon sx={{ color: '#4caf50' }} />;
        case 'rejected':
          return <RejectedIcon sx={{ color: '#f44336' }} />;
        case 'cancelled':
          return <CancelledIcon sx={{ color: '#9e9e9e' }} />;
        default:
          return <PendingIcon sx={{ color: '#ff9800' }} />;
      }
    }
    return <RequestIcon sx={{ color: '#2196f3' }} />;
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
      cancelled: { color: 'default', label: 'Cancelled' },
      pending: { color: 'warning', label: 'Pending' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip 
        label={config.label} 
        color={config.color}
        size="small"
        variant="filled"
        sx={{ height: 20, fontSize: '0.6rem', minWidth: 60 }}
      />
    );
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMs = now - new Date(date);
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

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

  const scrollToSection = (sectionId) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        const yOffset = -80;
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        borderRadius: '0px',
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        backdropFilter: 'blur(10px)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.98) 100%)'
      }}
    >
      <Toolbar sx={{ minHeight: {xs: 64, md: 74}, py: {xs: .5, md: 1}, px: {xs: 1.5, sm: 3} }}>
        {/* Logo/Image - Left Side */}
      <Box 
  component={RouterLink} 
  to={user ? "/request-uniform" : "/"}
  sx={{ 
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      opacity: 0.9
    }
  }}
>
  <img 
    src="/images/navbarbg.png" 
    alt="Uniform Request Logo" 
    style={{ 
      height: 'clamp(36px, 4vw, 52px)',
      width: 'auto',
      objectFit: 'contain'
    }}
  />
  {!user && <Typography sx={{display:{xs:'none',sm:'block'},ml:1,color:'#132d50',fontWeight:800,
    fontSize:{sm:'.8rem',md:'.98rem'},lineHeight:1.16,letterSpacing:'.01em',whiteSpace:'nowrap'}}>
    PHINMA ARAULLO<br/>UNIVERSITY
  </Typography>}
  {!user && <Box sx={{height:36,width:'1px',bgcolor:'#b8cce0',mx:{sm:1,md:2},display:{xs:'none',sm:'block'}}}/>}
  <Typography 
    variant="h5" 
    sx={{ 
      ml: 1,
      color: '#0071a5',
      fontWeight: 'bold',
      fontSize: { xs: '1.05rem', sm: '1.3rem', md: '1.6rem' },
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #0071a5 0%, #00b4db 100%)',
      backgroundClip: 'text',
      textFillColor: 'transparent',
    }}
  >
    UniformRequest
  </Typography>
</Box>

        {/* Navigation Buttons - Center */}
        {user ? (
          <Box sx={{ flexGrow: 1, display: {xs:'none', lg:'flex'}, justifyContent: 'center', gap: 0 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/request-uniform"
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#000000',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                  color: '#0071a5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,113,165,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Request Uniform
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/track-request"
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#000000',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                  color: '#0071a5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,113,165,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              My Track Request
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/profile"
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#000000',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                  color: '#0071a5',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(0,113,165,0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Profile
            </Button>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, display: {xs:'none', lg:'flex'}, justifyContent: 'center', gap: 0 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#000000',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                  color: '#0071a5',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              onClick={() => scrollToSection('about')}
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#000000',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                  color: '#0071a5',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              About
            </Button>
            <Button 
              color="inherit" 
              onClick={() => scrollToSection('contact')}
              sx={{ 
                fontWeight: '600',
                fontSize: '1rem',
                textTransform: 'none',
                mx: 2,
                color: '#000000',
                borderRadius: '25px',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                  color: '#0071a5',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Contact
            </Button>
          </Box>
        )}

        {/* Right Side - Notification Bell and Logout/Auth Buttons */}
        <Box sx={{ display: {xs:'none', lg:'flex'}, alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
          {user ? (
            <>
              {/* Notification Bell - for students only */}
              {user.role === 'student' && (
                <IconButton
                  color="inherit"
                  onClick={handleNotificationClick}
                  sx={{ 
                    color: '#000000',
                    background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    position: 'relative',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0,113,165,0.2) 0%, rgba(0,180,219,0.2) 100%)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 4px 15px rgba(0,113,165,0.3)'
                    },
                    transition: 'all 0.3s ease',
                    '&::before': unreadCount > 0 ? {
                      content: '""',
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 12,
                      height: 12,
                      backgroundColor: '#ff4444',
                      borderRadius: '50%',
                      animation: 'pulse 2s infinite'
                    } : {}
                  }}
                >
                  <Badge 
                    badgeContent={unreadCount} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        height: 20,
                        minWidth: 20,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
                        boxShadow: '0 2px 8px rgba(255,68,68,0.4)'
                      }
                    }}
                  >
                    <NotificationsIcon 
                      sx={{ 
                        fontSize: 24,
                        color: unreadCount > 0 ? '#0071a5' : '#666666'
                      }} 
                    />
                  </Badge>
                </IconButton>
              )}
              
              {/* Logout Button */}
              <Button 
                color="inherit" 
                onClick={handleLogoutClick}
                sx={{ 
                  fontWeight: '600',
                  fontSize: '1rem',
                  textTransform: 'none',
                  color: '#000000',
                  borderRadius: '25px',
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, rgba(211,47,47,0.1) 0%, rgba(244,67,54,0.1) 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(211,47,47,0.2) 0%, rgba(244,67,54,0.2) 100%)',
                    color: '#d32f2f',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 15px rgba(211,47,47,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: '600',
                  fontSize: '1rem',
                  textTransform: 'none',
                  color: '#000000',
                  borderRadius: '25px',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                    color: '#0071a5',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Log in
              </Button>
              <Button 
                variant="contained" 
                component={RouterLink} 
                to="/register"
                sx={{ 
                  fontWeight: '600',
                  fontSize: '1rem',
                  textTransform: 'none',
                  borderRadius: '25px',
                  px: 4,
                  background: 'linear-gradient(135deg, #0071a5 0%, #00b4db 100%)',
                  boxShadow: '0 4px 15px rgba(0,113,165,0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #005a8c 0%, #0099cc 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,113,165,0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
        <IconButton aria-label="Open navigation menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)} sx={{display:{xs:'inline-flex',lg:'none'},ml:'auto',color:'#0071a5',minHeight:44,minWidth:44}}><MenuIcon /></IconButton>
      </Toolbar>

      {/* Responsive right-side navigation drawer. Desktop navbar remains unchanged. */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, zIndex: (theme) => theme.zIndex.modal + 1 }}
        PaperProps={{
          sx: {
            width: { xs: 'min(72vw, 280px)', sm: '300px', md: '320px' },
            maxWidth: '100vw',
            height: '100dvh',
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            overflowY: 'auto',
            borderRadius: '18px 0 0 18px',
            bgcolor: '#ffffff',
            boxShadow: '-12px 0 38px rgba(4, 30, 61, .22)'
          }
        }}
      >
        {/* Mobile-only branding. The header has no extra blue background or empty padding. */}
        <Box sx={{
          position: 'relative', flexShrink: 0,
          width: '100%',
          mx: 0, mt: 0,
          height: { xs: 118, sm: 125 },
          minHeight: 0,
          overflow: 'hidden',
          backgroundColor: 'transparent'
        }}>
          <Box component="img" src="/images/GoldenAccents.png" alt=""
            aria-hidden="true"
            sx={{
              width: '100%', height: '100%', display: 'block',
              objectFit: 'cover', objectPosition: 'center', borderRadius: '18px 0 12px 12px'
            }} />
          <IconButton
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            sx={{
              position: 'absolute', top: 10, right: 10, zIndex: 2,
              width: 30, height: 30, color: '#ffffff',
              bgcolor: 'rgba(2,35,73,.40)',
              '&:hover': { bgcolor: 'rgba(2,35,73,.60)' },
              '& svg': { fontSize: 20 }
            }}
          ><CloseIcon /></IconButton>
          <Box sx={{
            position: 'absolute', zIndex: 1,
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: .7,
            width: 'calc(100% - 18px)', minWidth: 0
          }}>
            <Box component="img" src="/images/navbarbg.png" alt="PHINMA AU logo"
              sx={{ width: 31, height: 31, objectFit: 'contain', flexShrink: 0 }} />
            <Typography sx={{
              minWidth: 0, fontWeight: 800,
              fontSize: { xs: '.86rem', sm: '1rem' },
              lineHeight: 1.15, whiteSpace: 'nowrap', letterSpacing: '-.025em',
              color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,.35)'
            }}>
              Uniform<Typography component="span" sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: '#bce9ff' }}>Request</Typography>
            </Typography>
          </Box>
        </Box>

        <List component="nav" aria-label="Mobile navigation" sx={{ px: 1.5, py: 2.5, flex: '1 0 auto' }}>
          {(user ? [
            { label: 'Request Uniform', path: '/request-uniform', icon: <UniformMenuIcon /> },
            { label: 'My Track Request', path: '/track-request', icon: <TrackMenuIcon /> },
            { label: 'Profile', path: '/profile', icon: <ProfileMenuIcon /> }
          ] : [
            { label: 'Home', path: '/', icon: <HomeMenuIcon /> },
            { label: 'About', section: 'about', icon: <AboutMenuIcon /> },
            { label: 'Contact', section: 'contact', icon: <ContactMenuIcon /> },
            { label: 'Log in', path: '/login', icon: <LoginMenuIcon /> },
            { label: 'Register', path: '/register', icon: <RegisterMenuIcon /> }
          ]).map((item, index) => {
            const active = item.path === window.location.pathname || (!user && item.path === '/' && window.location.pathname === '/');
            return (
              <React.Fragment key={item.label}>
                {index === (!user ? 3 : 3) && !user && <Divider sx={{ my: 2, mx: 1, borderColor: '#d8e2ed' }} />}
                <ListItemButton
                  selected={active}
                  onClick={() => {
                    setMobileOpen(false);
                    if (item.section) scrollToSection(item.section);
                    else navigate(item.path);
                  }}
                  sx={{
                    borderRadius: '13px', minHeight: 52, mb: .8, px: 1.5,
                    color: '#102c4b',
                    '&.Mui-selected': { bgcolor: '#dbeeff', color: '#034e97', '&:hover': { bgcolor: '#cce6fc' } },
                    '&:hover': { bgcolor: '#edf6fc' }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: 'inherit', '& svg': { fontSize: 23 } }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '1rem', fontWeight: active ? 700 : 500 }} />
                </ListItemButton>
              </React.Fragment>
            );
          })}
          {user && <>
            <Divider sx={{ my: 2, mx: 1, borderColor: '#d8e2ed' }} />
            <ListItemButton onClick={() => { setMobileOpen(false); handleLogoutClick(); }}
              sx={{ borderRadius: '13px', minHeight: 54, px: 2, color: '#b83232', '&:hover': { bgcolor: '#fff0f0' } }}>
              <ListItemIcon sx={{ minWidth: 44, color: 'inherit' }}><LogoutMenuIcon /></ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '1rem', fontWeight: 600 }} />
            </ListItemButton>
          </>}
        </List>

        <Box aria-hidden="true" sx={{ flexShrink: 0, height: 55, overflow: 'hidden', position: 'relative',
          background: 'linear-gradient(160deg, #ffffff 0%, #ffffff 40%, #07588f 41%, #07588f 78%, #ffc73e 79%, #ffc73e 86%, #087ab4 87%)' }} />
      </Drawer>
      {/* Notification Menu - INCREASED HEIGHT */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: { 
            width: { xs: 'calc(100vw - 24px)', sm: 600 }, // Responsive notification panel
            height: 450, // INCREASED HEIGHT - from 500 to 600
            maxHeight: 500, // INCREASED MAX HEIGHT
            borderRadius: '20px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,0,0,0.08)',
            marginTop: 1,
            overflow: 'hidden'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header - TALLER */}
        <CardContent sx={{ 
          p: 3.5, // Increased padding
          pb: 2.5,
          background: 'linear-gradient(135deg, #0071a5 0%, #00b4db 100%)',
          color: 'white',
          minHeight: 90 // Increased header height
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}> {/* Increased gap */}
              <Avatar sx={{ width: 45, height: 45, bgcolor: 'rgba(255,255,255,0.2)' }}> {/* Larger avatar */}
                <NotificationsIcon sx={{ fontSize: 26 }} /> {/* Larger icon */}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold" sx={{ fontSize: '1.4rem' }}> {/* Larger text */}
                  Notifications
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.9rem' }}> {/* Larger text */}
                  {unreadCount} unread • {notifications.length} total
                </Typography>
              </Box>
            </Box>
            {unreadCount > 0 && (
              <Button 
                startIcon={<ReadIcon sx={{ fontSize: 20 }} />} // Larger icon
                onClick={handleMarkAllAsRead}
                size="medium" // Larger button
                sx={{ 
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '18px',
                  px: 2.5,
                  py: 1,
                  fontSize: '0.85rem',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.15)'
                  }
                }}
              >
                Mark all
              </Button>
            )}
          </Box>
        </CardContent>

        <Divider />
        
        {/* Notifications List - TALLER */}
        <Box sx={{ 
          height: 450, // INCREASED HEIGHT - from 350 to 450
          maxHeight: 450,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,113,165,0.3)',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(0,113,165,0.5)',
          }
        }}>
          {loadingNotifications ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}> {/* Increased padding */}
              <CircularProgress size={40} sx={{ color: '#0071a5' }} /> {/* Larger spinner */}
              <Typography variant="body1" sx={{ ml: 2, color: '#0071a5' }}>
                Loading notifications...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}> {/* Increased padding */}
              <NotificationsIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} /> {/* Larger icon */}
              <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                No notifications yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                You'll see updates about your requests here
              </Typography>
            </Box>
          ) : (
            notifications.slice(0, 10).map((notification) => ( // Show more notifications (10 instead of 8)
              <MenuItem 
                key={notification._id} 
                onClick={() => handleMarkAsRead(notification._id, notification.requestId)}
                sx={{
                  p: 3, // Increased padding
                  minHeight: 95, // INCREASED HEIGHT for each notification item
                  borderBottom: '1px solid rgba(0,0,0,0.05)',
                  background: notification.isRead ? 'transparent' : 'linear-gradient(135deg, rgba(0,113,165,0.04) 0%, rgba(0,180,219,0.04) 100%)',
                  position: 'relative',
                  '&:hover': {
                    background: 'linear-gradient(135deg, rgba(0,113,165,0.1) 0%, rgba(0,180,219,0.1) 100%)',
                    transform: 'translateX(4px)'
                  },
                  transition: 'all 0.2s ease',
                  '&::before': !notification.isRead ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5, // Slightly thicker indicator
                    background: 'linear-gradient(135deg, #0071a5 0%, #00b4db 100%)',
                    borderTopRightRadius: 6,
                    borderBottomRightRadius: 6
                  } : {}
                }}
              >
                <ListItemIcon sx={{ minWidth: 55 }}> {/* Increased minWidth */}
                  <Avatar sx={{ 
                    width: 42, // Larger avatar
                    height: 42, 
                    bgcolor: notification.isRead ? 'rgba(0,0,0,0.08)' : 'rgba(0,113,165,0.12)',
                    color: notification.isRead ? '#666' : '#0071a5'
                  }}>
                    {getNotificationIcon(notification.type, notification.requestStatus)}
                  </Avatar>
                </ListItemIcon>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}> {/* Increased margin */}
                    <Typography 
                      variant="subtitle1" // Larger text
                      sx={{ 
                        fontWeight: notification.isRead ? '500' : '600',
                        color: notification.isRead ? 'text.primary' : '#0071a5',
                        lineHeight: 1.4,
                        fontSize: '0.95rem' // Slightly larger font
                      }}
                    >
                      {notification.message}
                    </Typography>
                    {getStatusChip(notification.requestStatus)}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.8rem' }}> {/* Larger text */}
                      {notification.uniformType}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.8rem' }}> {/* Larger text */}
                      {getTimeAgo(notification.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                {!notification.isRead && (
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16,
                    width: 10, // Larger dot
                    height: 10,
                    backgroundColor: '#0071a5',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s infinite'
                  }} />
                )}
              </MenuItem>
            ))
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2, textAlign: 'center' }}> {/* Increased padding */}
              <Button 
                size="medium" // Larger button
                startIcon={<ClearIcon />}
                onClick={handleNotificationClose}
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  borderRadius: '20px',
                  px: 3,
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Close
              </Button>
            </Box>
          </>
        )}
      </Menu>

      {/* LOGOUT CONFIRMATION DIALOG */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle id="logout-dialog-title" sx={{ 
          textAlign: 'center',
          background: 'linear-gradient(135deg, #0071a5 0%, #00b4db 100%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.3rem'
        }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <DialogContentText 
            id="logout-dialog-description" 
            sx={{ fontSize: '1.1rem', color: 'text.primary' }}
          >
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 2, p: 3 }}>
          <Button 
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{ 
              borderRadius: '25px',
              px: 4,
              py: 1,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: '600',
              borderColor: '#0071a5',
              color: '#0071a5',
              '&:hover': {
                backgroundColor: 'rgba(0,113,165,0.1)',
                borderColor: '#0071a5'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogoutConfirm}
            variant="contained"
            sx={{ 
              borderRadius: '25px',
              px: 4,
              py: 1,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #0071a5 0%, #00b4db 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #005a8c 0%, #0099cc 100%)'
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add CSS animation for pulse effect */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.7; } /* More noticeable pulse */
            100% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </AppBar>
    </>
  );
};

export default Navbar;