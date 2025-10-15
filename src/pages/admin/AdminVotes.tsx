import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogContent } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PageHeader from "../../components/SectionHeader";
import InfoCard from "../../components/InfoCard";
import { useGet } from "../../hooks/useGet";
import { useMutation } from "../../hooks/useMutation";
import { useSignalR } from "../../hooks/useSignalR";
import NewVote from "../../popups/NewVote";

// --- Tipos ---
export interface PollOption {
  id: number;
  text: string;
}

export interface PollResult {
  pollOptionId: number;
  votesCount: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  deletedAt?: string | null;
  state: string;
  categoryPollId: number;
  userId?: number;
  pollOptions: PollOption[];
  pollResults: PollResult[];
}

interface VoteDto {
  user_Id: number;
  poll_Id: number;
  pollOption_Id: number;
}

interface PollVoteResult {
  pollId: number;
  results: { pollOptionId: number; votesCount: number }[];
}

interface UserCountResponse {
  totalUsers: number;
}

// --- Componente principal ---
export default function AdminVotes() {
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { data: pollsData, loading, error } = useGet<Poll[]>(
    "https://localhost:7245/api/polls/with-results"
  );

  const { mutate: sendVote, error: voteError } = useMutation(
    "https://localhost:7245/api/votes",
    "post"
  );

  const { on, connected } = useSignalR({
    url: "https://localhost:7245/pollHub",
  });

  // ✅ Traemos el total de usuarios una sola vez
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const res = await fetch("https://localhost:7245/api/User/count");
        const data: UserCountResponse = await res.json();
        setTotalUsers(data.totalUsers);
      } catch (err) {
        console.error("Error al obtener total de usuarios:", err);
      }
    };
    fetchUserCount();
  }, []);

  useEffect(() => {
    if (pollsData) setPolls(pollsData);
  }, [pollsData]);

  useEffect(() => {
    if (!connected) return;
    on("PollUpdated", (voteData: PollVoteResult) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === voteData.pollId
            ? {
                ...poll,
                pollResults: voteData.results.map((r) => ({
                  pollOptionId: r.pollOptionId,
                  votesCount: r.votesCount,
                })),
              }
            : poll
        )
      );
    });
  }, [connected, on]);

  const handleVote = async (pollId: number, optionId: number) => {
    const vote: VoteDto = {
      user_Id: 2, // reemplazar con usuario real
      poll_Id: pollId,
      pollOption_Id: optionId,
    };
    try {
      await sendVote(vote);
    } catch (err) {
      console.error("Error al enviar voto:", err);
    }
  };

  if (loading) return <p>Cargando votaciones...</p>;
  if (error) return <p>Error al cargar: {error}</p>;

  return (
    <div className="page">
      <PageHeader
        title="Gestión de Votaciones"
        actions={
          <Button variant="contained" color="secondary" onClick={handleOpen}>
            + Nueva Votación
          </Button>
        }
        tabs={[
          { label: "Todas", value: "todas" },
          { label: "Activas", value: "actives" },
          { label: "Finalizadas", value: "finalizada" },
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <NewVote
            onSuccess={() => window.location.reload()}
            onCancel={handleClose}
          />
        </DialogContent>
      </Dialog>

      {polls.length === 0 ? (
        <p>No hay votaciones disponibles.</p>
      ) : (
        polls.map((poll) => {
          const options = (poll.pollOptions || []).slice(0, 8);
          const optionsValid = options.length >= 2 && options.length <= 8;

          const resultsMap = new Map<number, number>();
          (poll.pollResults || []).forEach((r) =>
            resultsMap.set(r.pollOptionId, r.votesCount)
          );

          const totalVotes = Array.from(resultsMap.values()).reduce(
            (s, v) => s + v,
            0
          );

          // ✅ Cálculo basado en total de usuarios
          let progressPercent = 0;
          if (optionsValid && totalUsers > 0) {
            progressPercent = Math.min(
              Math.round((totalVotes / totalUsers) * 100),
              100
            );
          }

          const optionFields = options.map((o) => {
            const count = resultsMap.get(o.id) ?? 0;
            const percent =
              totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
            return { label: `${o.text}: ${count} votos (${percent}%)` };
          });

          const invalidOptionsField = !optionsValid
            ? [{ label: "La votación debe tener entre 2 y 8 opciones" }]
            : [];

          const normalizedState = poll.state?.toLowerCase().trim();
          const canVote = normalizedState === "activa" && optionsValid;

          return (
            <InfoCard
              key={poll.id}
              title={poll.title}
              description={poll.description}
              fields={[
                {
                  icon: <CalendarTodayIcon fontSize="small" />,
                  label: new Date(poll.createdAt).toLocaleDateString(),
                  value: "",
                },
              ]}
              chips={[
                {
                  label:
                    normalizedState === "activa" ? "Activa" : "Finalizada",
                  color: normalizedState === "activa" ? "success" : "default",
                },
              ]}
              progress={progressPercent}
              progressLabel={`Participación: ${progressPercent}% de usuarios`}
              optionalFields={[
                ...invalidOptionsField,
                ...optionFields,
                { label: `Total votos emitidos: ${totalVotes}` },
                { label: `Total usuarios: ${totalUsers}` },
              ]}
              extraActions={options.map((opt) => ({
                label: `Votar "${opt.text}"`,
                color: "secondary",
                variant: "contained",
                onClick: () => canVote && handleVote(poll.id, opt.id),
                icon: <CheckCircleOutlineIcon />,
                disabled: !canVote,
              }))}
              sx={{ mt: 2 }}
            />
          );
        })
      )}

      {voteError && (
        <p style={{ color: "red" }}>Error al enviar el voto: {voteError}</p>
      )}
    </div>
  );
}
