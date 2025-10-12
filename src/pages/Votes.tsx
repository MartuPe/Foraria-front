import { useState } from "react";
import { Box } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Layout } from "../components/layout";

export default function Votes() {
  // usa los mismos values que ya tenía tu app: "todas" | "actives" | "finalizada"
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");

  return (
    <Layout>
      <Box className="foraria-page-container">
        <PageHeader
          title="Votaciones del Consorcio"
          tabs={[
            { label: "Todas", value: "todas" },
            { label: "Activas", value: "actives" },
            { label: "Finalizadas", value: "finalizada" },
          ]}
          selectedTab={tab}
          onTabChange={(v) => setTab(v as typeof tab)}
          // Fuerza estilo píldoras rellenas
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
        />

        <InfoCard
          title="Encuesta de Satisfacción"
          description="Participa y comparte tu opinión sobre la nueva funcionalidad."
          fields={[{ icon: <CalendarTodayIcon fontSize="small" />, label: "15 Nov 2024 - 30 Nov 2024", value: "" }]}
          chips={[{ label: "Activa", color: "success" }]}
          progress={64}
          progressLabel="Votos registrados"
          optionalFields={[{ label: "A favor: 45 (79%)" }, { label: "En contra: 12 (21%)" }]}
          extraActions={[
            { label: "Votar a favor", color: "success", variant: "contained", onClick: () => alert("Voto a favor"), icon: <CheckCircleOutlineIcon /> },
            { label: "Votar en contra", color: "error", variant: "contained", onClick: () => alert("Voto en contra"), icon: <HighlightOffIcon /> },
          ]}
          sx={{ mt: 2 }}
        />
      </Box>
    </Layout>
  );
}
