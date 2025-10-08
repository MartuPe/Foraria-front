import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Divider,
  Button,
} from "@mui/material";

export interface InfoChip {
  label: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

export interface InfoField {
  label: string;
  value: string | number;
}

export interface InfoCardProps {
  title: string;
  subtitle?: string;
  chips?: InfoChip[];
  fields?: InfoField[];
  optionalFields?: string[];
  price?: string | number;
  filesCount?: number;
  image?: string;
  actions?: { label: string; icon?: React.ReactNode; onClick?: () => void }[];
  sx?: object;
}

export default function InfoCard({
  title,
  subtitle,
  chips = [],
  fields = [],
  optionalFields = [],
  price,
  filesCount,
  image,
  actions = [],
  sx = {},
}: InfoCardProps) {
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
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {/* Columna izquierda: contenido */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={1}>
            {/* Imagen + título + chips */}
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
              </Box>
            </Stack>

            {/* Campos + Archivos */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {fields.map((f, i) => (
                <Typography key={i} variant="body2" color="text.secondary">
                  <strong>{f.label}: </strong>
                  {f.value}
                </Typography>
              ))}
              {filesCount !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  📄 {filesCount} archivo(s)
                </Typography>
              )}
            </Stack>

         

            {/* Campos opcionales */}
          
          </Stack>
        </Box>

        {/* Columna derecha: acciones + precio */}
        <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 160 }}>
          {price && (
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary"
              sx={{ whiteSpace: "nowrap" }}
            >
              ${price}
            </Typography>
          )}
          {actions.length > 0 && (
            <Stack direction="row" spacing={1}>
              {actions.map((a, i) => (
               <Button
  key={i}
  variant="outlined"
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

         
            <Divider sx={{ my: 1 }} />

  {optionalFields.length > 0 && (
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {optionalFields.map((text, i) => (
                  <Typography key={i} variant="body2" color="text.secondary">
                    {text}
                  </Typography>
                ))}
              </Stack>
            )}

    </Paper>
  );
}
