import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  MenuItem,
  Select,
  Button,
  Avatar,
  Chip,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import NewUser from "../../components/modals/NewUser";
import PageHeader from "../../components/SectionHeader";
import ShieldIcon from "@mui/icons-material/Shield";
import HomeIcon from "@mui/icons-material/Home";
import {
  getTotalOwners,
  getTotalTenants,
  getUsersByConsortium,
  ROLE_META,
  type UserListItem,
} from "../../services/userManagementService";

const sortByNewest = <T extends { id: number }>(arr: T[]) =>
  [...arr].sort((a, b) => b.id - a.id);

const consortiumId = Number(localStorage.getItem("consortiumId"));

export default function AdminUserManagment() {
  const [openNewUser, setOpenNewUser] = useState(false);

  const [owners, setOwners] = useState<number>(0);
  const [tenants, setTenants] = useState<number>(0);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [roleFilter, setRoleFilter] = useState<
    "all" | "Administrador" | "Propietario" | "Inquilino"
  >("all");
  const [search, setSearch] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [tOwners, tTenants, list] = await Promise.all([
        getTotalOwners(consortiumId),
        getTotalTenants(consortiumId),
        getUsersByConsortium(consortiumId),
      ]);
      setOwners(tOwners ?? 0);
      setTenants(tTenants ?? 0);
      setUsers(sortByNewest(list ?? []));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let data = users;

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          (u.mail ?? "").toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "all") {
      data = data.filter((u) => u.role === roleFilter);
    }

    return data;
  }, [users, search, roleFilter]);

  return (
    // 👇 Igual que en Reclamos: sin maxWidth / mx
    <Box className="foraria-page-container">
      <PageHeader
        title="Gestión de Usuarios"
        showSearch
        onSearchChange={(q) => setSearch(q)}
        // si querés aire extra entre header y lista, podés sumar:
        // sx={{ mb: { xs: 2, md: 3 } }}
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlined />}
            onClick={() => setOpenNewUser(true)}
            sx={{
              px: { xs: 2, sm: 2.5 },
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "0 6px 16px rgba(245,158,11,.25)",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Nuevo Usuario
          </Button>
        }
        stats={[
          {
            icon: <ShieldIcon />,
            title: "Propietarios",
            value: owners,
            color: "success",
          },
          {
            icon: <HomeIcon />,
            title: "Inquilinos",
            value: tenants,
            color: "info",
          },
        ]}
        filters={[
          <Select
            key="roles"
            value={roleFilter}
            size="small"
            sx={{
              minWidth: { xs: 140, sm: 180 },
              width: { xs: "100%", sm: "auto" },
            }}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <MenuItem value="all">Todos los roles</MenuItem>
            <MenuItem value="Propietario">Propietarios</MenuItem>
            <MenuItem value="Inquilino">Inquilinos</MenuItem>
            <MenuItem value="Administrador">Administradores</MenuItem>
          </Select>,
        ]}
      />

      <NewUser
        open={openNewUser}
        onClose={() => setOpenNewUser(false)}
        onCreated={() => {
          loadData();
        }}
      />

      <Paper
        variant="outlined"
        elevation={0}
        className="foraria-profile-section"
        sx={{
          mt: 2,
          p: { xs: 2, md: 2.5 },
          borderRadius: 3,
        }}
      >
        {loading ? (
          <Typography variant="body2">Cargando…</Typography>
        ) : filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay usuarios para mostrar.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {filtered.map((u) => {
              const roleMeta =
                ROLE_META[u.role] ?? {
                  label: u.role,
                  chipColor: "default" as const,
                };
              const initials = `${u.firstName?.[0] ?? ""}${
                u.lastName?.[0] ?? ""
              }`.toUpperCase();
              const residence = u.residences?.[0];
              const depto = residence
                ? `${residence.number ?? ""}${
                    residence.floor ? ` · Piso ${residence.floor}` : ""
                  }`
                : "—";

              return (
                <Paper
                  key={u.id}
                  elevation={1}
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: 2,
                    borderRadius: 3,
                    bgcolor: "background.paper",
                    width: "100%",
                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease",
                    "&:hover": {
                      boxShadow: { xs: 1, sm: 4 },
                      transform: { xs: "none", sm: "translateY(-2px)" },
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "#7c3aed",
                      width: { xs: 44, sm: 48 },
                      height: { xs: 44, sm: 48 },
                      fontSize: { xs: 16, sm: 18 },
                    }}
                  >
                    {initials || "U"}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 0.5, flexWrap: "wrap" }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: 14, sm: 16 },
                        }}
                      >
                        {u.firstName} {u.lastName}
                      </Typography>
                      <Chip
                        size="small"
                        label={roleMeta.label}
                        color={roleMeta.chipColor}
                      />
                      {u.requiresPasswordChange && (
                        <Chip
                          size="small"
                          label="Pendiente"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 0.5, sm: 2 }}
                      sx={{
                        color: "text.secondary",
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {u.mail}
                      </Typography>
                      {u.phoneNumber ? (
                        <Typography variant="body2">
                          +{u.phoneNumber}
                        </Typography>
                      ) : null}
                      <Typography variant="body2">Depto. {depto}</Typography>
                    </Stack>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
