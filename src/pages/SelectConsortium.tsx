import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Skeleton,
  Snackbar,
  Alert,
  Box,
  Dialog,
  DialogContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "../components/SectionHeader";
import { useNavigate } from "react-router-dom";
import { residenceService } from "../services/residenceService";
import { setActiveConsortium } from "../services/consortiumStorage";
import NewResidence from "../components/modals/NewResidence";

type Residence = {
  id: number;
  number: number;
  floor: number;
  tower: string;
  consortiumId: number;
};

export default function SelectConsortium() {
  const [items, setItems] = useState<Residence[]>([]);
  const [loading, setLoading] = useState(true);

  // Controles 
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  // Modal "Nueva residencia"
  const [openNew, setOpenNew] = useState(false);

  // Toast
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error" | "info";
  }>({ open: false, msg: "", sev: "success" });

  const nav = useNavigate();

  // Debounce simple para la búsqueda
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const openSnack = useCallback(
    (msg: string, sev: "success" | "error" | "info" = "success") => {
      setSnack({ open: true, msg, sev });
    },
    []
  );

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await residenceService.getAll();
      setItems(data);
    } catch (e) {
      console.error(" Error al cargar residencias:", e);
      openSnack("Error al cargar residencias ", "error");
    } finally {
      setLoading(false);
    }
  }, [openSnack]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Filtro por texto
  const filtered = useMemo(() => {
    if (!qDebounced) return items;
    return items.filter((r) => {
      const txt = `${r.tower ?? ""} ${r.floor ?? ""} ${r.number ?? ""} ${r.consortiumId ?? ""}`.toLowerCase();
      return txt.includes(qDebounced);
    });
  }, [items, qDebounced]);

  
  const SkeletonCard = () => (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
          <div>
            <Skeleton variant="text" width={220} height={28} />
            <Skeleton variant="text" width={280} />
            <Skeleton variant="text" width={200} />
          </div>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={120} height={36} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  // Acción “Entrar”
  const enter = (r: Residence) => {
    setActiveConsortium({ id: r.consortiumId, name: `Consorcio ${r.consortiumId}`, tower: r.tower });
   
    nav("/admin", { replace: true });
  };

  return (
    <div className="page">
      <PageHeader
        title="Elegí el consorcio a gestionar"
        actions={
          <Button variant="contained" color="secondary" onClick={() => setOpenNew(true)}>
            + Nueva residencia
          </Button>
        }
      />

      {/* Buscador (estilo Suppliers) */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2}>
        <TextField
          placeholder="Buscar por torre, piso, unidad o consorcio…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Lista */}
      <Stack spacing={2}>
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : filtered.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No encontramos residencias
              </Typography>
              <Typography color="text.secondary" paragraph>
                Probá limpiar la búsqueda o recargar la página.
              </Typography>
              <Button variant="outlined" onClick={() => setQ("")}>
                Limpiar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              alignItems: "stretch",
            }}
          >
            {filtered.map((r) => (
              <Card key={r.id} variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <div>
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ wordBreak: "break-word" }}
                        title={`Torre ${r.tower}`}
                      >
                        Torre {r.tower}
                      </Typography>

                      <Typography color="text.secondary">
                        Piso {r.floor} • Unidad {r.number}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Consorcio #{r.consortiumId}
                      </Typography>
                    </div>

                    <Button variant="contained" onClick={() => enter(r)}>
                      Entrar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Stack>

      {/* Snackbar global */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Modal: Nueva residencia (ABM desde la misma vista) */}
      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <NewResidence
            onSuccess={() => {
              setOpenNew(false);
              fetchAll();
              openSnack("Residencia creada");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
