// src/components/AdminLayout.js - UPDATED
import React from 'react';
import { Box } from '@mui/material';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <Box className="uniform-admin-shell" sx={{ display: 'flex', minWidth:0, width:'100%' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          pt: { xs: '76px', md: 3 },
          minWidth: 0,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'auto',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;