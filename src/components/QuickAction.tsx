import * as React from "react";
import { Paper, ButtonBase, Stack, Box, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function QuickAction({
  icon,
  title,
  subtitle,
  onClick,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
  to?: string;
}) {
  const linkProps = to
    ? ({ component: RouterLink, to } as any)
    : ({} as any);

  return (
    <Paper variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
      <ButtonBase
        {...linkProps}
        onClick={onClick}
        sx={{
          width: "100%",
          height: "100%",
          p: 2.5,
          borderRadius: 3,
          display: "grid",
          gridTemplateColumns: "56px 1fr",
          alignItems: "center",
          columnGap: 2,
          textAlign: "left",
        }}
        aria-label={title}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
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

        <Stack spacing={0.2} sx={{ justifyContent: "center" }}>
          <Typography sx={{ fontWeight: 900, fontSize: 18, lineHeight: 1.15 }}>
            {title}
          </Typography>
          <Typography sx={{ color: "foraria.muted", fontSize: 14 }}>
            {subtitle}
          </Typography>
        </Stack>
      </ButtonBase>
    </Paper>
  );
}
