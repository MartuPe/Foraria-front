import InfoCard from "../components/InfoCard";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Box } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import PersonIcon from '@mui/icons-material/Person';
import ShieldIcon from '@mui/icons-material/Shield';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Select, MenuItem } from "@mui/material";



export default function UserManagment() {

  return (


     <Box className="foraria-page-container">

          <PageHeader
      title="Gestion de Usuarios"
      showSearch
      onSearchChange={(q) => console.log("Buscar:", q)}
      stats={[
        { icon: <PersonIcon />, title: "Total Usuarios", value: 5, color: "primary" },
        { icon: <ShieldIcon />, title: "Propietarios", value: 2, color: "success" },
         { icon: <HomeIcon />, title: "Inquilinos", value: 2, color: "info" },
          { icon: <CalendarTodayIcon />, title: "Pendientes", value: 1, color: "secondary" },
      ]}
      filters={[
        <Select defaultValue="all" size="small">
          <MenuItem value="all">Todos los roles</MenuItem>
          <MenuItem value="prop">Propietarios</MenuItem>
          <MenuItem value="inq">Inquilinos</MenuItem>
        </Select>,
        <Select defaultValue="all" size="small">
          <MenuItem value="all">Todos los estados</MenuItem>
          <MenuItem value="active">Activos</MenuItem>
          <MenuItem value="pending">Pendientes</MenuItem>
        </Select>,
      ]}
      selectedTab="all"
      onTabChange={(v) => console.log("Tab:", v)}
    />  

    <InfoCard
      title="Maria Gonzales"
      chips={[
        { label: "Propietario", color: "primary" },
        { label: "Activo", color: "success" },
      ]}
      fields={[
        { label: "Maria.gonzales@gmail.com", value: "" },
        { label: "+541123455678", value: "" },
        { label: "Depto. 3A", value: "" },
      ]}
      optionalFields={
        [ { label: "Registrado" } ,
          { label: "Ultimo Acceso" }
]}
      image="../assets/profile-photo.jpg"
      actions={[
        { label: "Ver", icon: <VisibilityOutlinedIcon /> },
        { label: "Editar", icon: <EditOutlinedIcon /> },
      ]}
    />


    </Box>

  );
}