import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Divider,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DownloadIcon from "@mui/icons-material/Download";

export interface InfoChip {
  label: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info";
}

export interface InfoField {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface InfoAction {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: "text" | "outlined" | "contained";
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
}

export interface InfoFile {
  name: string;
  size: number;
  url?: string;
  type?: string;
}

export interface InfoCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  chips?: InfoChip[];
  fields?: InfoField[];
  optionalFields?: { icon?: React.ReactNode; label: string }[];
  price?: string | number;
  filesCount?: number;
  image?: string;
  files?: InfoFile[];
  progress?: number;
  progressLabel?: string;
  actions?: InfoAction[];
  extraActions?: InfoAction[];
  sx?: object;
  showDivider?: boolean;
}

export default function InfoCard({
  title,
  subtitle,
  description,
  chips = [],
  fields = [],
  optionalFields = [],
  price,
  filesCount,
  image,
  files = [],
  progress,
  progressLabel,
  actions = [],
  extraActions = [],
  sx = {},
  showDivider = false,
}: InfoCardProps) {
  const renderFileAvatar = (file: InfoFile) => {
    const type = (file.type ?? file.name.split(".").pop() ?? "").toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(type);
    const isPdf = type === "pdf";

    if (isImage && file.url) {
      return <Avatar variant="rounded" src={file.url} sx={{ width: 56, height: 56, borderRadius: 1 }} />;
    }
    if (isPdf) {
      return (
        <Avatar sx={{ bgcolor: "#E53935", width: 56, height: 56 }}>
          <PictureAsPdfIcon />
        </Avatar>
      );
    }
    return (
      <Avatar sx={{ bgcolor: "grey.200", color: "text.primary", width: 56, height: 56 }}>
        <InsertDriveFileIcon />
      </Avatar>
    );
  };

  const handleOpen = (url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (file: InfoFile) => {
    if (!file.url) return;
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 16px rgba(8,61,119,0.06)",
        ...sx,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {image && (
            <Box
              component="img"
              src={image}
              alt="imagen"
              sx={{
                width: 60,
                height: 60,
                borderRadius: 2,
                objectFit: "cover",
                flexShrink: 0,
              }}
            />
          )}

          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                {title}
              </Typography>
              {chips.map((chip, i) => (
                <Chip
                  key={i}
                  size="small"
                  label={chip.label}
                  color={chip.color && chip.color !== "default" ? chip.color : undefined}
                  sx={{ fontWeight: 500 }}
                />
              ))}
            </Stack>

            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {subtitle}
              </Typography>
            )}

            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}

            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1 }}>
              {fields.map((f, i) => (
                <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {f.icon}
                  <Typography variant="body2" color="text.secondary">
                    <strong>{f.label} </strong>
                    {f.value}
                  </Typography>
                </Box>
              ))}

              {filesCount !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  📄 {filesCount} archivo(s)
                </Typography>
              )}
            </Stack>
          </Box>

          <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 160 }}>
            {price && (
              <Typography variant="h6" fontWeight={700} color="primary" sx={{ whiteSpace: "nowrap" }}>
                ${price}
              </Typography>
            )}
            {actions.length > 0 && (
              <Stack direction="row" spacing={1}>
                {actions.map((a, i) => (
                  <Button
                    key={i}
                    variant={a.variant ?? "outlined"}
                    color={a.color ?? "primary"}
                    size="small"
                    startIcon={a.icon}
                    onClick={a.onClick}
                    sx={{
                      minWidth: 0,
                      px: 1.2,
                      py: 0.5,
                      fontSize: "0.75rem",
                      textTransform: "none",
                    }}
                  >
                    {a.label}
                  </Button>
                ))}
              </Stack>
            )}
          </Stack>
        </Stack>

        {showDivider && <Divider sx={{ my: 1 }} />}

        {progress !== undefined && (
          <Box sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              {progressLabel && (
                <Typography variant="body2" color="text.secondary">
                  {progressLabel}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {progress}%
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={progress} color="primary" sx={{ borderRadius: 2, height: 8 }} />
          </Box>
        )}

        {optionalFields.length > 0 && (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {optionalFields.map((field, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {field.icon}
                <Typography variant="body2" color="text.secondary">
                  {field.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}

        {/* Sección de archivos compacta (20% ancho) sin nombre ni tamaño */}
        {files.length > 0 && (
          <>
            <Divider />
            <Stack direction="column" alignItems="flex-start">
  <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>
    Archivos adjuntos ({files.length})
  </Typography>

  <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-start" }}>
    <List dense sx={{ pt: 0, width: "100%", display: "flex", gap: 1 }}>
  {files.map((f, i) => (
    <ListItem
      key={i}
      sx={{
        py: 0.5,
        px: 0,
        display: "flex",
        alignItems: "center",
        width: "auto",
      }}
    >
      <ListItemAvatar>{renderFileAvatar(f)}</ListItemAvatar>

      {/* espacio flexible para separar avatar de los botones */}
      <Box sx={{ flex: 1 }} />

      {/* Botones a la derecha, en su propio contenedor */}
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
        <Tooltip title="Abrir">
          <IconButton size="small" onClick={() => handleOpen(f.url)}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Descargar">
          <IconButton size="small" onClick={() => handleDownload(f)}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </ListItem>
  ))}
</List>
              </Box>
            </Stack>
          </>
        )}

        {extraActions.length > 0 && (
          <Stack direction="row" spacing={1}>
            {extraActions.map((a, i) => (
              <Button
                key={i}
                variant={a.variant ?? "outlined"}
                color={a.color ?? "primary"}
                size="small"
                startIcon={a.icon}
                onClick={a.onClick}
                sx={{
                  minWidth: 0,
                  px: 1.2,
                  py: 0.5,
                  fontSize: "1rem",
                  textTransform: "none",
                }}
              >
                {a.label}
              </Button>
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
