import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { Layout } from "../components/layout";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { useSignalR } from "../hooks/useSignalR";

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

// --- Componente principal ---
export default function Votes() {
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");
  const [polls, setPolls] = useState<Poll[]>([]);


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

  useEffect(() => {
    if (pollsData) setPolls(pollsData);
  }, [pollsData]);

  useEffect(() => {
    if (!connected) return;
    on("PollUpdated", (voteData: PollVoteResult) => {
      setPolls((prevPolls) =>
        prevPolls.map((poll) =>
          poll.id === voteData.pollId
            ? { ...poll, pollResults: voteData.results.map((r) => ({ pollOptionId: r.pollOptionId, votesCount: r.votesCount })) }
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
         
          
        />

        {polls.length === 0 ? (
          <p>No hay votaciones disponibles.</p>
        ) : (
          polls.map((poll) => {
            const options = (poll.pollOptions || []).slice(0, 8);
            const optionsValid = options.length >= 2 && options.length <= 8;

            const resultsMap = new Map<number, number>();
            (poll.pollResults || []).forEach((r) => resultsMap.set(r.pollOptionId, r.votesCount));
            const totalVotes = Array.from(resultsMap.values()).reduce((s, v) => s + v, 0);

            let progressPercent = 0;
            if (optionsValid && totalVotes > 0) {
              const counts = options.map((o) => resultsMap.get(o.id) ?? 0);
              const max = Math.max(...counts, 0);
              progressPercent = Math.round((max / totalVotes) * 100);
            }

            const optionFields = options.map((o) => {
              const count = resultsMap.get(o.id) ?? 0;
              const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              return { label: `${o.text}: ${count} votos (${percent}%)` };
            });

            const invalidOptionsField = !optionsValid ? [{ label: "La votación debe tener entre 2 y 8 opciones" }] : [];

            const canVote = poll.state === "activa" && optionsValid;

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
                    label: poll.state === "activa" ? "Activa" : "Finalizada",
                    color: poll.state === "activa" ? "success" : "default",
                  },
                ]}
                progress={progressPercent}
                progressLabel="Votos registrados"
                optionalFields={[...invalidOptionsField, ...optionFields, { label: `Total votos: ${totalVotes}` }]}
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

        {voteError && <p style={{ color: "red" }}>Error al enviar el voto: {voteError}</p>}
      </Box>
    </Layout>
  );
}
