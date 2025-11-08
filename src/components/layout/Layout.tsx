// src/components/layout/Layout.tsx
import React from "react";
import { Box, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AdminSidebar } from "./AdminSidebar";

const DRAWER_WIDTH = 240;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [open, setOpen] = React.useState(!isMobile);
  React.useEffect(() => { setOpen(!isMobile); }, [isMobile, location.pathname]);

  const toggle = () => setOpen(s => !s);
  const close  = () => { if (isMobile && !location.pathname.startsWith("/forums")) setOpen(false); };

  const SidebarComp = isAdminRoute ? AdminSidebar : Sidebar;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SidebarComp open={open} onClose={close} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create(["margin"]),
          ml: open && !isMobile ? `${DRAWER_WIDTH}px` : 0,
        }}
      >
        {isMobile && (
          <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: theme.zIndex.drawer + 1 }}>
            <IconButton onClick={toggle} sx={{ backgroundColor: theme.palette.primary.main, color: "white", "&:hover": { backgroundColor: theme.palette.primary.dark } }}>
              <MenuIcon />
            </IconButton>
          </Box>
        )}
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
