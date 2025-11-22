import React, { useState, useMemo } from "react";
import { Box, Button, Dialog, DialogContent, DialogActions, DialogTitle, Stack, TextField, MenuItem, Paper, Typography, Chip, Card, CardContent, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, } from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutline,
  VisibilityOutlined,
} from "@mui/icons-material";
import PageHeader from "../../components/SectionHeader";
import { useGet } from "../../hooks/useGet";
import NewDocument from "../../components/modals/NewDocument";
import { ForariaStatusModal } from "../../components/StatCardForms";

// Tipos actualizados según el backend
interface Document {
  id: number;
  title: string;
  description?: string;
  category: string;
  createdAt: string;
  url: string;
  user_id: number;
  consortium_id: number;
}

const categories = [
  "Reglamentos",
  "Actas",
  "Presupuestos",
  "Manuales",
  "Escrituras",
  "Comprobantes",
  "Otros",
];

const API_BASE =
  process.env.REACT_APP_API_URL || "https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api";

export default function AdminDocuments() {
  const [tab, setTab] = useState<"todos" | "publicos" | "privados">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");
  const [openNew, setOpenNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [statusModal, setStatusModal] = useState<{
    open: boolean;
    variant: "success" | "error";
    title: string;
    message: string;
  }>({
    open: false,
    variant: "error",
    title: "",
    message: "",
  });

  const {
    data: documents,
    loading,
    error,
    refetch,
  } = useGet<Document[]>("/UserDocument");

  // Filtros
  const filteredDocuments = useMemo(() => {
    if (!documents || !Array.isArray(documents)) return [];

    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        categoryFilter === "Todas" || doc.category === categoryFilter;

      // De momento todos se consideran "públicos"
      const matchesTab = tab === "todos" || tab === "publicos";

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [documents, searchQuery, categoryFilter, tab]);

  // KPIs básicos
  const totalDocs = Array.isArray(documents) ? documents.length : 0;
  const publicDocs = totalDocs; // TODO: implementar lógica de público/privado

  // Handlers básicos
  const handleView = (doc: Document) => {
    if (doc.url) {
      window.open(doc.url, "_blank", "noopener,noreferrer");
    } else {
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo abrir el documento",
        message: "Este documento no tiene un archivo asociado para visualizar.",
      });
    }
  };

  const handleEdit = (doc: Document) => {
    console.log("Editar documento (pendiente):", doc);
    setStatusModal({
      open: true,
      variant: "error",
      title: "Edición no disponible",
      message:
        "La edición de documentos estará disponible próximamente desde esta pantalla.",
    });
  };

  const handleDelete = (doc: Document) => {
    setDeleteConfirm(doc);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      const res = await fetch(
        `${API_BASE}/UserDocument/${deleteConfirm.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 204 || res.ok) {
        setStatusModal({
          open: true,
          variant: "success",
          title: "Documento eliminado",
          message: "El documento se eliminó correctamente.",
        });
        setDeleteConfirm(null);
        await refetch();
      } else if (res.status === 404) {
        setStatusModal({
          open: true,
          variant: "error",
          title: "Documento no disponible",
          message:
            "El documento ya no existe o fue eliminado previamente.",
        });
        setDeleteConfirm(null);
        await refetch();
      } else {
        console.error("Error al eliminar documento", await res.text());
        setStatusModal({
          open: true,
          variant: "error",
          title: "No se pudo eliminar el documento",
          message:
            "Ocurrió un problema al eliminar el documento. Intentá nuevamente más tarde.",
        });
      }
    } catch (e) {
      console.error("Error de red al eliminar documento", e);
      setStatusModal({
        open: true,
        variant: "error",
        title: "No se pudo eliminar el documento",
        message:
          "No pudimos conectarnos con el servidor. Intentá nuevamente más tarde.",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Gestión de Documentos" />
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            mt: 2,
          }}
        >
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Cargando documentos…</Typography>
        </Paper>
      </div>
    );
  }

  if (error) {
    console.error("Error cargando documentos", error);
    return (
      <div className="page">
        <PageHeader title="Gestión de Documentos" />
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 2,
            mt: 2,
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            No se pudieron cargar los documentos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hubo un problema al conectar con el servidor. Intentá nuevamente.
          </Typography>
          <Button variant="contained" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Paper>
      </div>
    );
  }

  if (!Array.isArray(documents)) {
    console.error("Estructura de datos inesperada en /UserDocument", documents);
    return (
      <div className="page">
        <PageHeader title="Gestión de Documentos" />
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2, mt: 2, }} >
          <Typography variant="h6" color="error" gutterBottom>
            No se pudo mostrar la información
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Recibimos un formato de datos inesperado. Intentá recargar la
            página más tarde.
          </Typography>
          <Button variant="contained" onClick={() => refetch()}>
            Reintentar
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Gestión de Documentos"
        actions={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddOutlined />}
            onClick={() => setOpenNew(true)}
          >
            Nuevo documento
          </Button>
        }
        tabs={[
          { label: "Todos", value: "todos" },
          { label: "Públicos", value: "publicos" },
          { label: "Privados", value: "privados" },
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
      />

      {/* KPIs simplificados */}
      <Stack direction="row" spacing={2} sx={{ mb: 2, mt: 1 }}>
        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="primary.main">
              {totalDocs}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total de documentos
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="success.main">
              {publicDocs}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Documentos visibles
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filtros básicos */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }} >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar documentos…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <TextField
            select
            size="small"
            label="Categoría"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: { xs: "100%", md: 200 } }}
          >
            <MenuItem value="Todas">Todas</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Documento</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Categoría</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }} >
                        {doc.title || "Sin título"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description || "Sin descripción"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.category || "Sin categoría"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      Usuario #{doc.user_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(doc.createdAt).toLocaleDateString("es-AR")}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleView(doc)}
                        sx={{ color: "primary.main" }}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(doc)}
                        sx={{ color: "info.main" }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(doc)}
                        sx={{ color: "error.main" }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDocuments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {totalDocs === 0 ? "Todavía no hay documentos cargados." : "No se encontraron documentos con los filtros seleccionados."}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="md" fullWidth >
        <DialogContent>
          <NewDocument
            onSuccess={() => {
              setOpenNew(false);
              refetch();
            }}
            onCancel={() => setOpenNew(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => {
          if (!deleting) setDeleteConfirm(null);
        }}
      >
        <DialogTitle>Eliminar documento</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            ¿Seguro que querés eliminar este documento?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {deleteConfirm?.title}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm(null)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      <ForariaStatusModal
        open={statusModal.open}
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            open: false,
          }))
        }
        variant={statusModal.variant}
        title={statusModal.title}
        message={statusModal.message}
        primaryActionLabel="Aceptar"
      />
    </div>
  );
}
