import * as React from "react";
import { Paper, ButtonBase, Stack, Box, Typography } from "@mui/material";

export default function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <Paper>
      <ButtonBase
        onClick={onClick}
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          textAlign: "left",
          gap: 2,
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: "#fff5ea",
            color: "#e4a062",
            display: "grid",
            placeItems: "center",
            fontSize: 22,
            border: "1px solid #ffe7d0",
          }}
        >
          {icon}
        </Box>

        <Stack spacing={0.2}>
          <Typography sx={{ fontWeight: 900, fontSize: 18 }}>{title}</Typography>
          <Typography sx={{ color: "foraria.muted", fontSize: 14 }}>
            {subtitle}
          </Typography>
        </Stack>
      </ButtonBase>
    </Paper>
  );
}
