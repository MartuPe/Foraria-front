import { Box } from "@mui/material";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Layout } from "../components/layout";

export default function Votes() {
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
          selectedTab="todas"
          onTabChange={(v) => console.log("Tab:", v)}
        />

        <InfoCard
          title="Encuesta de Satisfacción"
          description="Participa y comparte tu opinión sobre la nueva funcionalidad."
          fields={[
            { icon: <CalendarTodayIcon fontSize="small" />, label: "15 Nov 2024 - 30 Nov 2024", value: "" },
          ]}
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
