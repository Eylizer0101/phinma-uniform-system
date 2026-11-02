// src/App.js - UPDATE
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RequestUniform from './pages/RequestUniform';
import TrackRequest from './pages/TrackRequest';
import RequestDetails from './pages/RequestDetails';
import EditRequest from './pages/EditRequest';
// IDINAGDAG: Email Verification Page
import EmailVerification from './pages/EmailVerification';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRequestDetails from './pages/admin/AdminRequestDetails';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import Archive from './pages/admin/Archive'; // IDINAGDAG
import ArchiveDetails from './pages/admin/ArchiveDetails'; // IDINAGDAG
import AdminUserDetails from './pages/admin/AdminUserDetails'; // IDINAGDAG
import ResetPassword from './pages/ResetPassword';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0071a5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#000000',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#424242',
    },
  },
  typography: {
    fontFamily: '"Arial", "Helvetica", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            {/* Hide navbar for admin routes */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={<Navbar />} />
            </Routes>
            
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* IDINAGDAG: Email Verification Route */}
                <Route path="/email-verification" element={<EmailVerification />} />

                {/* Protected Routes - Only for logged in users */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/request-uniform" 
                  element={
                    <ProtectedRoute>
                      <RequestUniform />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/track-request" 
                  element={
                    <ProtectedRoute>
                      <TrackRequest />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/request-details/:id" 
                  element={
                    <ProtectedRoute>
                      <RequestDetails />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/edit-request/:id" 
                  element={
                    <ProtectedRoute>
                      <EditRequest />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/requests" 
                  element={
                    <AdminProtectedRoute>
                      <AdminRequests />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/request-details/:id" 
                  element={
                    <AdminProtectedRoute>
                      <AdminRequestDetails />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/analytics" 
                  element={
                    <AdminProtectedRoute>
                      <AdminAnalytics />
                    </AdminProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <AdminProtectedRoute>
                      <AdminUsers />
                    </AdminProtectedRoute>
                  } 
                />
                {/* IDINAGDAG: User Details Route */}
                <Route 
                  path="/admin/users/:id" 
                  element={
                    <AdminProtectedRoute>
                      <AdminUserDetails />
                    </AdminProtectedRoute>
                  } 
                />
                {/* IDINAGDAG: Archive Route */}
                <Route 
                  path="/admin/archive" 
                  element={
                    <AdminProtectedRoute>
                      <Archive />
                    </AdminProtectedRoute>
                  } 
                />
                {/* IDINAGDAG: Archive Details Route */}
                <Route 
                  path="/admin/archive-details/:id" 
                  element={
                    <AdminProtectedRoute>
                      <ArchiveDetails />
                    </AdminProtectedRoute>
                  } 
                />
<Route path="/reset-password" element={<ResetPassword />} />
                
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;