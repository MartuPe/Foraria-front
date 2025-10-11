import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
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
  Tabs,
  Tab,
  Grid
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";
import FolderIcon from "@mui/icons-material/Folder";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import PageHeader from "../components/SectionHeader";
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
import "../styles/documents.css";

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

  // KPIs mock
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
        <Paper elevation={0} className="doc-container">
          <PageHeader title="Documentos" sx={{ mb: 2 }} />

          <Tabs
            className="doc-tabs"
            value={activeTab}
            onChange={(_, v) => setActiveTab(v as TabKey)}
            variant="fullWidth">
            <Tab value="general" label="Documentos Generales" />
            <Tab value="mine" label="Mis Documentos" />
          </Tabs>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Kpi icon={<FolderIcon />} title="Total Documentos" value={totalGeneral} color="primary" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Kpi icon={<DownloadDoneIcon />} title="Descargas Este Mes" value={downloadsThisMonth} color="success" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Kpi icon={<QueryBuilderIcon />} title="Última Actualización" value={lastUpdate} color="secondary" />
            </Grid>
          </Grid>

          <TextField
            size="small"
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="doc-search"/>

          {activeTab === "general" ? (
            <FilterBarGeneral filter={filterGeneral} onChange={setFilterGeneral} counts={countsGeneral} />
          ) : (
            <Stack direction="row" alignItems="center" justifyContent="space-between" className="mine-bar">
              <FilterBarMine filter={filterMine} onChange={setFilterMine} counts={countsMine} />
              <Button variant="contained" color="secondary" startIcon={<UploadIcon />} onClick={() => setOpenUpload(true)}>
                Subir Documento
              </Button>
            </Stack>
          )}

          <Stack spacing={2.0}>
            {(activeTab === "general" ? filteredGeneral : filteredMine).map((d) => (
              <Card key={d.id} elevation={0} variant="outlined" className="doc-card">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle1" className="card-title">
                      {d.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={d.category}
                      sx={{
                        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                        color: "primary.main",
                        fontWeight: 600,
                      }}/>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" className="card-desc">
                    {d.description}
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center" color="text.secondary" className="card-meta">
                    <Typography variant="caption">{formatSize(d.sizeKB)}</Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">{formatDate(d.date)}</Typography>
                  </Stack>

                  <Divider className="card-divider" />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setPreview(d)}>
                      Ver Detalle
                    </Button>

                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<CloudDownloadIcon />}
                      onClick={() => handleDownload(d)}>
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
            <Typography variant="body2" sx={{ mt: 1 }}>
              {preview?.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                <b>Categoría:</b> {preview?.category}
              </Typography>
              <Typography variant="body2">
                <b>Tamaño:</b> {preview && formatSize(preview.sizeKB)}
              </Typography>
              <Typography variant="body2">
                <b>Fecha:</b> {preview && formatDate(preview.date)}
              </Typography>
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

/* ===== Subcomponentes con clases ===== */
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
    <Paper variant="outlined" className="kpi-card">
      <Box className={`kpi-icon ${color}`}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
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
    <Stack direction="row" spacing={1} flexWrap="wrap" className="chips-row">
      {items.map((it) => (
        <Chip
          key={it.value}
          label={it.label}
          onClick={() => onSelect(it.value)}
          className={`chip${it.value === selected ? " chip--active" : ""}`}
        />
      ))}
    </Stack>
  );
}