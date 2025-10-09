// import { useEffect, useMemo, useState } from "react";
import {
  Box,
 //  Tabs,
 //  Tab,
 //  Card,
 //  CardContent,
 //  Typography,
  // Chip,
 //  LinearProgress,
 //  Stack,
 //  Button,
 //  Divider,
 //  Dialog,
 //  DialogTitle,
 //  DialogContent,
 //  DialogActions,
 //  Snackbar,
 //  Alert,
} from "@mui/material";
// import {
//   getVotes,
//   setVotes,
//   applyVote,
//   DEFAULT_VOTES,
//   VoteItem,
//   VoteStatus,
//   VoteAction,
// } from "../services/voteService";
import InfoCard from "../components/InfoCard";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PageHeader from "../components/SectionHeader";
// import TaskAltIcon from '@mui/icons-material/TaskAlt';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Sidebar } from "../components/layout";

// type TabKey = "all" | "active" | "closed" | "upcoming";

// function statusChip(status: VoteStatus) {
//   if (status === "active") {
//     return <Chip label="Activa" color="success" size="small" variant="outlined" />;
//   }
//   if (status === "closed") {
//     return <Chip label="Finalizada" color="default" size="small" variant="outlined" />;
//   }
//   return <Chip label="Próximamente" color="info" size="small" variant="outlined" />;
// }

// function percent(value: number, total: number) {
//   if (total <= 0) return 0;
//   const p = Math.round((value / total) * 100);
//   return Number.isFinite(p) ? p : 0;
// }

export default function Votes() {
  // const [tab, /*setTab*/] = useState<TabKey>("all");
  // const [votes, setVotesState] = useState<VoteItem[]>([]);

  // confirm dialog
  // const [/*open*/, setOpen] = useState(false);
  // const [current, setCurrent] = useState<VoteItem | null>(null);
  // const [action, setAction] = useState<VoteAction>("favor");

  // toast
  // const [/*toast*/, setToast] = useState<{ open: boolean; msg: string }>({
  //   open: false,
  //   msg: "",
  // });

  // load from localStorage (or seed)
  // useEffect(() => {
  //   const data = getVotes();
  //   setVotesState(data.length ? data : DEFAULT_VOTES);
  // }, []);

  // const counts = useMemo(() => {
  //   const all = votes.length;
  //   const active = votes.filter((v) => v.status === "active").length;
  //   const closed = votes.filter((v) => v.status === "closed").length;
  //   const upcoming = votes.filter((v) => v.status === "upcoming").length;
  //   return { all, active, closed, upcoming };
  // }, [votes]);

  // const filtered = useMemo(() => {
  //   if (tab === "all") return votes;
  //   if (tab === "active") return votes.filter((v) => v.status === "active");
  //   if (tab === "closed") return votes.filter((v) => v.status === "closed");
  //   return votes.filter((v) => v.status === "upcoming");
  // }, [tab, votes]);

  // function openDialog(v: VoteItem, a: VoteAction) {
  //   setCurrent(v);
  //   setAction(a);
  //   setOpen(true);
  // }

  // function closeDialog() {
  //   setOpen(false);
  //   setCurrent(null);
  // }

  // function confirmVote() {
  //   if (!current) return;
  //   // apply in memory
  //   const updated = applyVote(votes, current.id, action);
  //   setVotesState(updated);
  //   // persist
  //   setVotes(updated);

  //   setToast({
  //     open: true,
  //     msg:
  //       action === "favor"
  //         ? `¡Voto a favor confirmado para “${current.title}”!`
  //         : `¡Voto en contra confirmado para “${current.title}”!`,
  //   });
  //   closeDialog();
  // }

  return (
<Box className="foraria-layout">
    <Sidebar/>

   <Box className="foraria-page-container">

          <PageHeader
      title="Votaciones del Consorcio"
      tabs={[
         { label: "Todas", value: "todas" },
         { label: "Activas", value: "actives" },
         { label: "Finalizadas", value: "finalizada" },
      ]}
      selectedTab="all"
      onTabChange={(v) => console.log("Tab:", v)}
    />  
          <InfoCard
  title="Encuesta de Satisfacción"
  description="Participa y comparte tu opinión sobre la nueva funcionalidad."
  fields={[
    {  icon: <CalendarTodayIcon fontSize="small"/>,
      label: "15 Nov 2024 - 30 Nov 2024", value: ""},
]}
  chips={[{ label: "Activa", color: "success" }]}
  progress={64}
  progressLabel="Votos registrados"
  optionalFields={
        [ { label: "A favor: 45 (79%)" } ,
          { label: "En contra: 12 (21%)" }
]}
  extraActions={[
    { label: "Votar a favor", color: "success",variant: "contained", onClick: () => alert("Voto a favor"), icon: <CheckCircleOutlineIcon/>},
    { label: "Votar en contra",color: "error" , variant: "contained", onClick: () => alert("Voto en contra"), icon: <HighlightOffIcon/> },
  ]}
/>
</Box>
</Box>
   /** <Box className="foraria-page-container">
      <Box>   
      
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" color="primary">
            Votaciones del Consorcio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total de propietarios: 85
          </Typography>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            aria-label="Filtros de votaciones"
            sx={{ "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}
          >
            <Tab value="all" label={`Todas (${counts.all})`} />
            <Tab value="active" label={`Activas (${counts.active})`} />
            <Tab value="closed" label={`Finalizadas (${counts.closed})`} />
            <Tab value="upcoming" label={`Próximamente (${counts.upcoming})`} />
          </Tabs>
        </Box>

       <Stack spacing={2.5} sx={{ mt: 2 }}>
          {filtered.map((v) => {
            const participated = v.inFavor + v.against;
            const progress = percent(participated, v.totalOwners);
            const yesPct = percent(v.inFavor, participated);
            const noPct = percent(v.against, participated);
            const disabled = v.status !== "active" || v.hasVoted === true;

            
            return (
              
                <Card key={v.id} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {statusChip(v.status)}
                      <Typography variant="h6" color="primary">
                        {v.title}
                      </Typography>
                    </Stack>

                    {v.hasVoted && (
                      <Chip
                        label="Ya has votado en esta propuesta"
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {v.description}
                  </Typography>
                  

                  <Stack direction="row" spacing={3} sx={{ mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      📅 {v.startDate} - {v.endDate}
                    </Typography>
                  </Stack>

                  {v.status === "upcoming" && (
                    <Typography variant="body2" color="info.main" sx={{ mt: 1 }}>
                      ℹ️ La votación comenzará pronto
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Progreso de la votación
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        "& .MuiLinearProgress-bar": { bgcolor: "primary.dark" },
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 1 }}
                    >
                      <Stack direction="row" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          🟠 A favor: {v.inFavor} ({yesPct}%)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          🔴 En contra: {v.against} ({noPct}%)
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="primary.dark">
                        {participated} de {v.totalOwners} votos
                      </Typography>
                    </Stack>
                  </Box>

                  {v.status === "active" && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" spacing={2}>
                        <Button
                          variant="contained"
                          color="warning"
                          disabled={disabled}
                          onClick={() => openDialog(v, "favor")}
                        >
                          Votar a Favor
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          disabled={disabled}
                          onClick={() => openDialog(v, "against")}
                        >
                          Votar en Contra
                        </Button>
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>
*/


  /**     { Dialogo de confirmación }
      <Dialog open={open} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          🗳️ Confirmar Voto
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            ¿Estás seguro de que quieres votar{" "}
            <b>{action === "favor" ? "a favor" : "en contra"}</b> de la siguiente propuesta?
          </Typography>

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.primary">
              “{current?.title ?? ""}”
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="warning.main">⚠️</Typography>
            <Typography variant="body2" color="text.secondary">
              Una vez confirmado, no podrás cambiar tu voto.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={closeDialog}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={action === "favor" ? "warning" : "error"}
            onClick={confirmVote}
          >
            {action === "favor" ? "Confirmar Voto a Favor" : "Confirmar Voto en Contra"}
          </Button>
        </DialogActions>
      </Dialog>

      { Toast de éxito }
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ open: false, msg: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setToast({ open: false, msg: "" })}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>

    */
  );
}
