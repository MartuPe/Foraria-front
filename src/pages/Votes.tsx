import { useEffect, useState, useMemo } from "react";
import { Box } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PageHeader from "../components/SectionHeader";
import InfoCard from "../components/InfoCard";
import { Layout } from "../components/layout";
import { useGet } from "../hooks/useGet";
import { useMutation } from "../hooks/useMutation";
import { useSignalR } from "../hooks/useSignalR";
import ErrorModal from "../components/modals/ErrorModal";
import SuccessModal from "../components/modals/SuccessModal";


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


export default function Votes() {
  const [tab, setTab] = useState<"todas" | "actives" | "finalizada">("todas");
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [totalUsers, setTotalUsers] = useState<number>(0);

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
      user_Id: Number(localStorage.getItem("userId")),
      poll_Id: pollId,
      pollOption_Id: optionId,
    };
    try {
      await sendVote(vote);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error al enviar voto:", err);
      setShowErrorModal(true);
    }
  };


  const filteredPolls = useMemo(() => {
    let filtered = [...polls];

    if (tab === "actives") {
      filtered = filtered.filter(
        (p) => p.state.toLowerCase().trim() === "activa"
      );
    } else if (tab === "finalizada") {
      filtered = filtered.filter(
        (p) => p.state.toLowerCase().trim() === "finalizada"
      );
    }

    
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [polls, tab]);

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

        {filteredPolls.length === 0 ? (
          <p>No hay votaciones disponibles.</p>
        ) : (
          filteredPolls.map((poll) => {
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
                  ...optionFields,
                  { label: `Total votos emitidos: ${totalVotes}` },
                  { label: `Total usuarios: ${totalUsers}` },
                ]}
                extraActions={
                  canVote
                    ? options.map((opt) => ({
                        label: `Votar "${opt.text}"`,
                        color: "secondary",
                        variant: "contained",
                        onClick: () => handleVote(poll.id, opt.id),
                        icon: <CheckCircleOutlineIcon />,
                      }))
                    : []
                }
                sx={{ mt: 2 }}
              />
            );
          })
        )}

        <ErrorModal
          open={showErrorModal && !!voteError}
          onClose={() => setShowErrorModal(false)}
          errorMessage={voteError as string}
        />

        <SuccessModal
          open={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </Box>
    </Layout>
  );
}
