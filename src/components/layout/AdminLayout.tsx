import * as React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

type AdminLayoutProps = {
  children?: React.ReactNode; 
};

function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box className="foraria-layout">
      <AdminSidebar />
      <Box className="foraria-page-container">
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
}

export default AdminLayout;
export { AdminLayout };
