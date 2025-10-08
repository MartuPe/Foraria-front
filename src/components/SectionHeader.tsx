import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Tabs,
  Tab,
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
  filters?: React.ReactNode[]; // 👈 Aquí admitimos filtros adicionales
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
        <Typography variant="h5" color="primary">
          {title}
        </Typography>
        {actions && <Box>{actions}</Box>}
      </Stack>

      {/* Métricas */}
      {stats.length > 0 && (
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          {stats.map((s, i) => (
            <Paper
              key={i}
              elevation={0}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                gap: 2,
                flex: 1,
                minWidth: 200,
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
          ))}
        </Stack>
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
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              minHeight: 36,
              px: 2,
              mr: 1,
              border: "1px solid",
              borderColor: "divider",
            },
            "& .Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText !important",
              borderColor: "primary.main",
              boxShadow: "0 2px 8px rgba(8,61,119,0.25)",
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