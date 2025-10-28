import React, { useState } from "react";
import { Paper, MenuItem, Select, Button} from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import NewUser from "../../components/modals/NewUser";
import PageHeader from "../../components/SectionHeader";
import PersonIcon from "@mui/icons-material/Person";
import ShieldIcon from "@mui/icons-material/Shield";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export default function AdminUserManagment() {
  const [openNewUser, setOpenNewUser] = useState(false);

  return (
    <>
      <PageHeader
        title="Gestión de Usuarios"
        showSearch
        onSearchChange={(q) => console.log("Buscar:", q)}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlined />}
            onClick={() => setOpenNewUser(true)}
            sx={{
              px: 2.5,
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 6px 16px rgba(245,158,11,.25)",
            }}
          > Nuevo Usuario
          </Button>
        }
        stats={[
          { icon: <PersonIcon />, title: "Total Usuarios", value: 5, color: "primary" },
          { icon: <ShieldIcon />, title: "Propietarios", value: 2, color: "success" },
          { icon: <HomeIcon />, title: "Inquilinos", value: 2, color: "info" },
          { icon: <CalendarTodayIcon />, title: "Pendientes", value: 1, color: "secondary" },
        ]}
        filters={[
          <Select key="roles" defaultValue="all" size="small" sx={{ minWidth: 180 }}>
            <MenuItem value="all">Todos los roles</MenuItem>
            <MenuItem value="prop">Propietarios</MenuItem>
            <MenuItem value="inq">Inquilinos</MenuItem>
          </Select>,
          <Select key="status" defaultValue="all" size="small" sx={{ minWidth: 180 }}>
            <MenuItem value="all">Todos los estados</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="pending">Pendientes</MenuItem>
          </Select>,
        ]}
      />

      <NewUser
        open={openNewUser}
        onClose={() => setOpenNewUser(false)}
        onCreated={(resp) => {
          console.log("Usuario creado:", resp);
        }}
      />

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      </Paper>
    </>
  );
}
