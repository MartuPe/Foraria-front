import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Tabs,
  Tab,
  Grid
} from "@mui/material";
import { alpha } from "@mui/material/styles";

export interface StatItem {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color?: "primary" | "success" | "secondary" | "warning" | "info" | "error";
}

export interface TabItem {
  label: string;
  value: string;
}

interface PageHeaderProps {
  title: string;
  stats?: StatItem[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  tabs?: TabItem[];
  selectedTab?: string;
  onTabChange?: (value: string) => void;
  actions?: React.ReactNode;
  filters?: React.ReactNode[];
  sx?: object;
}

export default function PageHeader({
  title,
  stats = [],
  showSearch = false,
  searchPlaceholder = "Buscar...",
  onSearchChange,
  tabs = [],
  selectedTab,
  onTabChange,
  actions,
  filters = [],
  sx = {},
}: PageHeaderProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        bgcolor: "background.paper",
        borderColor: "divider",
        ...sx,
      }}
    >
      {/* Título + acción */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" fontWeight={600} color="primary">
          {title}
        </Typography>
        {actions && <Box>{actions}</Box>}
      </Stack>

      {/* Métricas (sólo si hay items) */}
      {stats.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {stats.map((s, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={(t) => ({
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 2,
                    bgcolor: alpha(t.palette[s.color || "primary"].main, 0.15),
                    color: t.palette[s.color || "primary"].main,
                  })}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {s.title}
                  </Typography>
                  <Typography variant="h6">{s.value}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Buscador + filtros opcionales */}
      {(showSearch || filters.length > 0) && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ mb: 2 }}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          {showSearch && (
            <TextField
              fullWidth
              size="small"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="foraria-form-input"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "& fieldset": { borderColor: "divider" },
                },
              }}
            />
          )}
          {filters.map((f, i) => (
            <Box key={i}>{f}</Box>
          ))}
        </Stack>
      )}

      {/* Tabs */}
      {tabs.length > 0 && (
        <Tabs
          value={selectedTab}
          onChange={(_, v) => onTabChange?.(v)}
          sx={{
            "& .MuiTabs-root": { mt: 0.5 },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 999,
              minHeight: 40,
              px: 2.5,
              mr: 1.5,
              border: "1px solid",
              borderColor: "divider",
              color: "text.secondary",
            },
            "& .MuiTab-root.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              borderColor: "primary.main",
              boxShadow: "0 6px 14px rgba(8,61,119,0.25)",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      )}
    </Paper>
  );
}