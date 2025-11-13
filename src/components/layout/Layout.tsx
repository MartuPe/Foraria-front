import React from "react";
import { Box, IconButton, useTheme, useMediaQuery } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { AdminSidebar } from "./AdminSidebar";

const DRAWER_WIDTH = 240;

export default function Layout() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(!isMobileOrTablet);
  }, [isMobileOrTablet, location.pathname]);

  const toggle = () => setOpen(s => !s);
  const close  = () => { if (isMobileOrTablet && !location.pathname.startsWith("/forums")) setOpen(false); };

  const SidebarComp = isAdminRoute ? AdminSidebar : Sidebar;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: { xs: "block", md: "grid" },
        gridTemplateColumns: { md: `${DRAWER_WIDTH}px 1fr` },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <SidebarComp
        open={open}
        onClose={close}
        variant={isMobileOrTablet ? "temporary" : "permanent"}
        width={DRAWER_WIDTH}
      />

      <Box component="main" sx={{ minWidth: 0 }}>
        {isMobileOrTablet && (
          <Box sx={{ position: "fixed", top: 16, left: 16, zIndex: theme.zIndex.drawer + 1 }}>
            <IconButton
              onClick={toggle}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: "white",
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
              aria-label="Abrir menú"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
