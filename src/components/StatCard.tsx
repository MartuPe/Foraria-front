import * as React from "react";
import { Paper, Stack, Typography, Box } from "@mui/material";

export default function StatCard({
  icon,
  label,
  value,
  accent = "none",
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: "success" | "warning" | "none";
}) {
  return (
    <Paper
      sx={{
        p: 2,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        borderColor: "divider",
        outline: accent !== "none" ? `2px solid rgba(0,0,0,0.05)` : "none",
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="subtitle2" sx={{ color: "foraria.muted" }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900 }}>
          {value}
        </Typography>
      </Stack>

      {icon ? (
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: "#f1f5fb",
            color: "#7285a7",
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            border: "1px solid #e8edf3",
          }}
        >
          {icon}
        </Box>
      ) : null}
    </Paper>
  );
}