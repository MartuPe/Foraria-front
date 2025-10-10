import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  TextField,
  Chip,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import DescriptionIcon from "@mui/icons-material/Description";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";
import FolderIcon from "@mui/icons-material/Folder";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";

import {
  GENERAL_DOCS,
  MY_DOCS_SEED,
  GeneralDoc,
  MyDoc,
  GeneralCategory,
  MyCategory,
  countByCategory,
  formatDate,
  formatSize,
} from "../services/documentService";

import NewDocument from "../popups/NewDocument";
import { Sidebar } from "../components/layout";
type TabKey = "general" | "mine";

export default function Documents() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [search, setSearch] = useState("");
  const [generalDocs] = useState<GeneralDoc[]>(GENERAL_DOCS);
  const [myDocs /*, setMyDocs*/] = useState<MyDoc[]>(MY_DOCS_SEED);
  const [filterGeneral, setFilterGeneral] = useState<GeneralCategory | "Todas">("Todas");
  const [filterMine, setFilterMine] = useState<MyCategory | "Todas">("Todas");

  const [preview, setPreview] = useState<GeneralDoc | MyDoc | null>(null);
  const [openUpload, setOpenUpload] = useState(false);

  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const totalGeneral = generalDocs.length;
  const downloadsThisMonth = 156;
  const lastUpdate = "15 Nov";

  const filteredGeneral = useMemo(() => {
    let list = generalDocs;
    if (filterGeneral !== "Todas") list = list.filter((d) => d.category === filterGeneral);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [generalDocs, filterGeneral, search]);

  const filteredMine = useMemo(() => {
    let list = myDocs;
    if (filterMine !== "Todas") list = list.filter((d) => d.category === filterMine);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [myDocs, filterMine, search]);

  const countsGeneral = countByCategory(generalDocs);
  const countsMine = countByCategory(myDocs);

  const handleDownload = (doc: GeneralDoc | MyDoc) => {
    setSnack({ open: true, msg: `Descargando "${doc.title}"...` });
  };

  return (
    <Box className="foraria-layout">
      <Sidebar />

      <Box className="foraria-page-container">
        <Paper
          elevation={0}
          sx={{
            maxWidth: 1200,
            mx: "auto",
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: "0 8px 28px rgba(8,61,119,0.08)",
            border: "1px solid",
            borderColor: "divider",
          }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <DescriptionIcon color="primary" />
            <Typography variant="h5" color="primary">Documentos</Typography>
            <Box sx={{ flex: 1 }} />
            <TextField
              size="small"
              placeholder="Buscar documentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: 320,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: "divider" },
                },
              }}
            />
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            centered
            sx={{
              mb: 2,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 36,
                px: 2,
              },
              "& .Mui-selected": {
                color: "primary.contrastText !important",
                bgcolor: "primary.main",
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(8,61,119,0.25)",
              },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            <Tab value="general" label="Documentos Generales" />
            <Tab value="mine" label="Mis Documentos" />
          </Tabs>

          {/* KPIs */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
            <Kpi icon={<FolderIcon />} title="Total Documentos" value={totalGeneral} color="primary" />
            <Kpi icon={<DownloadDoneIcon />} title="Descargas Este Mes" value={downloadsThisMonth} color="success" />
            <Kpi icon={<QueryBuilderIcon />} title="Última Actualización" value={lastUpdate} color="secondary" />
          </Stack>

          {/* Filtros + botón subir */}
          {activeTab === "general" ? (
            <FilterBarGeneral filter={filterGeneral} onChange={setFilterGeneral} counts={countsGeneral} />
          ) : (
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} spacing={2}>
              <FilterBarMine filter={filterMine} onChange={setFilterMine} counts={countsMine} />
              <Button
                variant="contained"
                color="info"
                startIcon={<UploadIcon />}
                onClick={() => setOpenUpload(true)}
              >
                Subir Documento
              </Button>
            </Stack>
          )}

          <Stack spacing={2.0}>
            {(activeTab === "general" ? filteredGeneral : filteredMine).map((d) => (
              <Card key={d.id} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{d.title}</Typography>
                    <Chip
                      size="small"
                      label={d.category}
                      sx={{
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        color: "primary.main",
                        fontWeight: 600,
                      }}
                    />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {d.description}
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center" color="text.secondary" sx={{ mt: 1 }}>
                    <Typography variant="caption">{formatSize(d.sizeKB)}</Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">{formatDate(d.date)}</Typography>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => setPreview(d)}>
                      Ver Detalle
                    </Button>
                    <Button variant="outlined" startIcon={<CloudDownloadIcon />} onClick={() => handleDownload(d)}>
                      Descargar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>

        <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="sm" fullWidth>
          <DialogContent>
            <Typography variant="h6">{preview?.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{preview?.description}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2}>
              <Typography variant="body2"><b>Categoría:</b> {preview?.category}</Typography>
              <Typography variant="body2"><b>Tamaño:</b> {preview && formatSize(preview.sizeKB)}</Typography>
              <Typography variant="body2"><b>Fecha:</b> {preview && formatDate(preview.date)}</Typography>
            </Stack>
          </DialogContent>
        </Dialog>

        <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="md" fullWidth>
          <DialogContent>
            <NewDocument />
          </DialogContent>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={2000}
          onClose={() => setSnack({ open: false, msg: "" })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

function Kpi({
  icon,
  title,
  value,
  color = "primary",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: "primary" | "success" | "secondary";
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 2, minWidth: 280 }}>
      <Box
        sx={(t) => ({
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(t.palette[color].main, 0.18),
          color: t.palette[color].main,
        })}
      >
        <>{icon}</>
      </Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h6">{value}</Typography>
      </Box>
    </Paper>
  );
}

function FilterBarGeneral({
  filter,
  onChange,
  counts,
}: {
  filter: GeneralCategory | "Todas";
  onChange: (c: GeneralCategory | "Todas") => void;
  counts: Record<string, number>;
}) {
  const cats: (GeneralCategory | "Todas")[] = [
    "Todas",
    "Reglamentos",
    "Actas",
    "Presupuestos",
    "Planos",
    "Seguros",
    "Manuales",
    "Emergencias",
    "Mantenimiento",
  ];
  return (
    <ChipsRow
      items={cats.map((c) => ({
        label: c === "Todas" ? `Todas (${Object.values(counts).reduce((a, b) => a + b, 0) || 8})` : `${c} (${counts[c] || 0})`,
        value: c,
      }))}
      selected={filter}
      onSelect={(v) => onChange(v as GeneralCategory | "Todas")}
    />
  );
}

function FilterBarMine({
  filter,
  onChange,
  counts,
}: {
  filter: MyCategory | "Todas";
  onChange: (c: MyCategory | "Todas") => void;
  counts: Record<string, number>;
}) {
  const cats: (MyCategory | "Todas")[] = [
    "Todas",
    "Escrituras",
    "Comprobantes",
    "Autorizaciones",
    "Certificados",
    "Reclamos",
    "Contratos",
  ];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <ChipsRow
      items={cats.map((c) => ({
        label: c === "Todas" ? `Todas (${total})` : `${c} (${counts[c] || 0})`,
        value: c,
      }))}
      selected={filter}
      onSelect={(v) => onChange(v as MyCategory | "Todas")}
    />
  );
}

function ChipsRow({
  items,
  selected,
  onSelect,
}: {
  items: { label: string; value: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
      {items.map((it) => (
        <Chip
          key={it.value}
          label={it.label}
          onClick={() => onSelect(it.value)}
          sx={{
            borderRadius: "999px",
            fontWeight: 600,
            bgcolor: it.value === selected ? "primary.main" : "secondary.main",
            color: it.value === selected ? "primary.contrastText" : "text.primary",
            "&:hover": {
              bgcolor:
                it.value === selected
                  ? "primary.main"
                  : (t) => alpha(t.palette.primary.main, 0.15),
            },
          }}
        />
      ))}
    </Stack>
  );
}
