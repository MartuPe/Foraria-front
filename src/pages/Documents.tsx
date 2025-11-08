import { useMemo, useState } from "react";
import { Box, Typography, Stack, TextField, Chip, Card, CardContent, Button, Dialog, DialogContent, Divider, Snackbar, Alert, Tabs, Tab, Paper, CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadIcon from "@mui/icons-material/Upload";
import FolderIcon from "@mui/icons-material/Folder";
import DownloadDoneIcon from "@mui/icons-material/DownloadDone";
import PageHeader from "../components/SectionHeader";
import {
  GENERAL_DOCS,
  GeneralDoc,
  GeneralCategory,
  countByCategory,
  formatDate,
  formatSize,
} from "../services/documentService";
import NewDocument from "../components/modals/NewDocument";
import { useGet } from "../hooks/useGet";
import "../styles/documents.css";

type TabKey = "general" | "mine";

interface ApiDocument {
  id: number;
  title: string;
  description?: string;
  category: string;
  createdAt: string;
  url: string;
  user_id: number;
  consortium_id: number;
}

const myDocCategories = [
  "Escrituras",
  "Comprobantes", 
  "Autorizaciones",
  "Certificados",
  "Reclamos",
  "Contratos",
  "Otros"
];

export default function Documents() {
  const [activeTab, setActiveTab] = useState<TabKey>("general");
  const [search, setSearch] = useState("");
  const [generalDocs] = useState<GeneralDoc[]>(GENERAL_DOCS);
  const [filterGeneral, setFilterGeneral] = useState<GeneralCategory | "Todas">("Todas");
  const [filterMine, setFilterMine] = useState<string>("Todas");

  const [preview, setPreview] = useState<GeneralDoc | ApiDocument | null>(null);
  const [openUpload, setOpenUpload] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  // 🔧 Obtener documentos reales de la API para "Mis Documentos"
  const { data: myDocsApi, loading: loadingMyDocs, error: errorMyDocs, refetch: refetchMyDocs } = 
    useGet<ApiDocument[]>("/UserDocument");

  console.log("📄 My Documents data:", myDocsApi);
  console.log("⚠️ My Documents error:", errorMyDocs);

  const totalGeneral = generalDocs.length;
  const totalMine = Array.isArray(myDocsApi) ? myDocsApi.length : 0;
  const downloadsThisMonth = 156;
  const filteredGeneral = useMemo(() => {
    let list = generalDocs;
    if (filterGeneral !== "Todas")
      list = list.filter((d) => d.category === filterGeneral);
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
    if (!Array.isArray(myDocsApi)) return [];
    
    let list = myDocsApi;
    if (filterMine !== "Todas")
      list = list.filter((d) => d.category === filterMine);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [myDocsApi, filterMine, search]);

  const countsGeneral = countByCategory(generalDocs);
  
  const countsMine = useMemo(() => {
    if (!Array.isArray(myDocsApi)) return {};
    const counts: Record<string, number> = {};
    myDocsApi.forEach(doc => {
      const cat = doc.category || "Otros";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [myDocsApi]);

  const handleDownload = (doc: GeneralDoc | ApiDocument) => {
    setSnack({ open: true, msg: `Descargando "${doc.title}"...` });
    
    if ("url" in doc && doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  const handleView = (doc: GeneralDoc | ApiDocument) => {
    setPreview(doc);
  };

  const handleUploadSuccess = () => {
    setOpenUpload(false);
    setSnack({ open: true, msg: "Documento subido exitosamente" });
    refetchMyDocs(); 
  };

  const renderMyDocumentsContent = () => {
    if (loadingMyDocs) {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress size={32} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Cargando tus documentos...
          </Typography>
        </Paper>
      );
    }

    if (errorMyDocs) {
      return (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.light" }}>
          <Typography variant="h6" color="error">
            Error al cargar documentos
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {errorMyDocs}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => refetchMyDocs()} 
            sx={{ mt: 2 }}
          >
            Reintentar
          </Button>
        </Paper>
      );
    }

    if (!Array.isArray(myDocsApi)) {
      return (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "warning.light" }}>
          <Typography variant="h6" color="warning.dark">
            Datos inesperados del servidor
          </Typography>
          <Typography variant="body2">
            Tipo recibido: {typeof myDocsApi}
          </Typography>
        </Paper>
      );
    }

    if (filteredMine.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            {totalMine === 0 ? "🚀 Aún no tienes documentos" : "No se encontraron documentos"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {totalMine === 0 ? "¡Sube tu primer documento!" : "Prueba con otros filtros"}
          </Typography>
          {totalMine === 0 && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadIcon />}
              onClick={() => setOpenUpload(true)}
              sx={{ mt: 2 }}
            >
              Subir Documento
            </Button>
          )}
        </Paper>
      );
    }

    return (
      <Stack spacing={2}>
        {filteredMine.map((doc) => (
          <Card key={doc.id} elevation={0} variant="outlined" className="doc-card">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" className="card-title">
                  {doc.title || "Sin título"}
                </Typography>
                <Chip
                  size="small"
                  label={doc.category || "Sin categoría"}
                  sx={{
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                className="card-desc"
              >
                {doc.description || "Sin descripción"}
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                color="text.secondary"
                className="card-meta"
              >
                <Typography variant="caption">
                  Usuario #{doc.user_id}
                </Typography>
                <Typography variant="caption">•</Typography>
                <Typography variant="caption">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </Typography>
              </Stack>

              <Divider className="card-divider" />

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleView(doc)}
                >
                  Ver Detalle
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                  onClick={() => handleDownload(doc)}
                >
                  Descargar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  return (
      <Box className="foraria-page-container">
        <PageHeader
          title="Documentos"
          stats={[
            {
              icon: <FolderIcon />,
              title: "Documentos Generales",
              value: totalGeneral,
              color: "primary",
            },
            {
              icon: <FolderIcon />,
              title: "Mis Documentos", 
              value: totalMine,
              color: "secondary",
            },
            {
              icon: <DownloadDoneIcon />,
              title: "Descargas Este Mes",
              value: downloadsThisMonth,
              color: "success",
            },
          ]}
        />

        <Tabs
          className="doc-tabs"
          value={activeTab}
          onChange={(_, v) => setActiveTab(v as TabKey)}
          variant="fullWidth"
        >
          <Tab value="general" label="Documentos Generales" />
          <Tab value="mine" label="Mis Documentos" />
        </Tabs>

        <TextField
          size="small"
          placeholder="Buscar documentos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="doc-search"
        />

        {activeTab === "general" ? (
          <FilterBarGeneral
            filter={filterGeneral}
            onChange={setFilterGeneral}
            counts={countsGeneral}
          />
        ) : (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            className="mine-bar"
          >
            <FilterBarMine
              filter={filterMine}
              onChange={setFilterMine}
              counts={countsMine}
            />
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadIcon />}
              onClick={() => setOpenUpload(true)}
            >
              Subir Documento
            </Button>
          </Stack>
        )}

        {/* Contenido según la pestaña activa */}
        {activeTab === "general" ? (
          <Stack spacing={2}>
            {filteredGeneral.map((d) => (
              <Card key={d.id} elevation={0} variant="outlined" className="doc-card">
                <CardContent>
                  {/* ...existing card content for general docs... */}
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
                      }}
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="card-desc"
                  >
                    {d.description}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    color="text.secondary"
                    className="card-meta"
                  >
                    <Typography variant="caption">
                      {formatSize(d.sizeKB)}
                    </Typography>
                    <Typography variant="caption">•</Typography>
                    <Typography variant="caption">
                      {formatDate(d.date)}
                    </Typography>
                  </Stack>

                  <Divider className="card-divider" />

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setPreview(d)}
                    >
                      Ver Detalle
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<CloudDownloadIcon />}
                      onClick={() => handleDownload(d)}
                    >
                      Descargar
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          renderMyDocumentsContent()
        )}

        {/* Modal de vista previa */}
        <Dialog
          open={!!preview}
          onClose={() => setPreview(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent>
            <Typography variant="h6">{preview?.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {preview?.description || "Sin descripción"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2}>
              <Typography variant="body2">
                <b>Categoría:</b> {preview?.category || "Sin categoría"}
              </Typography>
              {preview && "sizeKB" in preview && (
                <Typography variant="body2">
                  <b>Tamaño:</b> {formatSize(preview.sizeKB)}
                </Typography>
              )}
              <Typography variant="body2">
                <b>Fecha:</b> {
                  preview && "date" in preview
                    ? formatDate(preview.date)
                    : preview ? new Date((preview as ApiDocument).createdAt).toLocaleDateString() : "N/A"
                }
              </Typography>
            </Stack>
          </DialogContent>
        </Dialog>

        {/* Modal de subida de documentos */}
        <Dialog
          open={openUpload}
          onClose={() => setOpenUpload(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogContent>
            <NewDocument
              onSuccess={handleUploadSuccess}
              onCancel={() => setOpenUpload(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack({ open: false, msg: "" })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
  );
}

/* ===== Filtros ===== */

// colores estilo "Reclamos"
const COLOR_GRAY = "#666666";
const GENERAL_COLORS: Record<string, string> = {
  Todas: COLOR_GRAY,
  Reglamentos: "#1e88e5",
  Actas: "#42a5f5",
  Presupuestos: "#ff9800",
  Planos: "#26a69a",
  Seguros: "#7e57c2",
  Manuales: "#9c27b0",
  Emergencias: "#ef5350",
  Mantenimiento: "#1976d2",
};

const MINE_COLORS: Record<string, string> = {
  Todas: "#666666",
  Escrituras: "#1e88e5",
  Comprobantes: "#26a69a", 
  Autorizaciones: "#ff9800",
  Certificados: "#4caf50",
  Reclamos: "#ef5350",
  Contratos: "#7e57c2",
  Otros: "#9e9e9e",
};

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
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const items = cats.map((c) => ({
    label: c === "Todas" ? `Todas (${total || 0})` : `${c} (${counts[c] || 0})`,
    value: c,
    color: GENERAL_COLORS[c],
  }));

  return (
    <ChipsRow
      items={items}
      selected={filter}
      onSelect={(v) => onChange(v as GeneralCategory | "Todas")}
    />
  );
}

// Nuevo filtro para "Mis Documentos" usando categorías de la API
function FilterBarMine({
  filter,
  onChange,
  counts,
}: {
  filter: string;
  onChange: (c: string) => void;
  counts: Record<string, number>;
}) {
  const cats = ["Todas", ...myDocCategories];
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
  const items = cats.map((c) => ({
    label: c === "Todas" ? `Todas (${total || 0})` : `${c} (${counts[c] || 0})`,
    value: c,
    color: MINE_COLORS[c] || "#666666",
  }));

  return (
    <ChipsRow
      items={items}
      selected={filter}
      onSelect={(v) => onChange(v)}
    />
  );
}

function ChipsRow({
  items,
  selected,
  onSelect,
}: {
  items: { label: string; value: string; color: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" className="chips-row">
      {items.map((it) => {
        const active = it.value === selected;
        const hex = it.color || COLOR_GRAY;
        return (
          <Chip
            key={it.value}
            label={it.label}
            onClick={() => onSelect(it.value)}
            size="small"
            variant={active ? "filled" : "outlined"}
            sx={{
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.78rem",
              height: 32,
              borderRadius: "999px",
              borderColor: hex,
              color: active ? "#fff" : hex,
              bgcolor: active ? hex : "transparent",
              "&:hover": {
                bgcolor: active ? hex : `${hex}15`,
              },
            }}
          />
        );
      })}
    </Stack>
  );
}
