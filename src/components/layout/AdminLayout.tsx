import * as React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';


import { AdminSidebar } from './AdminSidebar';

type AdminLayoutProps = {
  children?: React.ReactNode; // ahora es opcional
};

function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: '#f5f5f5',
          ml: '240px', // mantiene offset del sidebar
          minHeight: '100vh',
        }}
      >
        
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
}


export default AdminLayout;
export { AdminLayout };
