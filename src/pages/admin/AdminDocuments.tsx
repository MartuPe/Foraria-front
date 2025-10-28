import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Stack,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Chip,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  AddOutlined,
  EditOutlined,
  DeleteOutline,
  VisibilityOutlined
} from "@mui/icons-material";
import PageHeader from "../../components/SectionHeader";
import { useGet } from "../../hooks/useGet";
import { useMutation } from "../../hooks/useMutation";
import NewDocument from "../../components/modals/NewDocument";

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
  "Otros"
];

export default function AdminDocuments() {
  const [tab, setTab] = useState<"todos" | "publicos" | "privados">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");
  const [openNew, setOpenNew] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Document | null>(null);

  // 🔧 CORREGIDO: Usar endpoint correcto del backend
  const { data: documents, loading, error, refetch } = useGet<Document[]>("/UserDocument");

  // Debug mejorado
  console.log("📄 UserDocuments data:", documents);
  console.log("📊 Total documentos encontrados:", Array.isArray(documents) ? documents.length : 0);

  // Filtros (solo si hay datos)
  const filteredDocuments = useMemo(() => {
    if (!documents || !Array.isArray(documents)) return [];
    
    return documents.filter(doc => {
      const matchesSearch = !searchQuery || 
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === "Todas" || doc.category === categoryFilter;
      
      // Para tabs: como no hay campo isPublic, usar todos por ahora
      const matchesTab = tab === "todos"; // TODO: implementar lógica de público/privado
      
      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [documents, searchQuery, categoryFilter, tab]);

  // KPIs básicos
  const totalDocs = Array.isArray(documents) ? documents.length : 0;
  const publicDocs = totalDocs; // TODO: implementar lógica de público/privado

  // Handlers básicos
  const handleView = (doc: Document) => {
    console.log("👁️ Viewing document:", doc);
    if (doc.url) {
      window.open(doc.url, '_blank');
    }
  };

  const handleEdit = (doc: Document) => {
    console.log("✏️ Edit document:", doc);
    alert(`Editar documento: ${doc.title}\n(Funcionalidad pendiente)`);
  };

  const handleDelete = (doc: Document) => {
    console.log("🗑️ Delete document:", doc);
    setDeleteConfirm(doc);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      alert("Funcionalidad de eliminación pendiente");
      setDeleteConfirm(null);
    }
  };

  // 🚨 Debug del estado de carga
  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Gestión de Documentos" />
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>⏳ Cargando documentos desde backend...</Typography>
          <Typography variant="caption" color="text.secondary">
            Endpoint: /UserDocument
          </Typography>
        </Paper>
      </div>
    );
  }

  // 🚨 Debug de errores de conexión
  if (error) {
    return (
      <div className="page">
        <PageHeader title="Gestión de Documentos" />
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.light" }}>
          <Typography variant="h6" color="error">
            ❌ Error de conexión con backend
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Error:</strong> {error}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 2 }}>
            💡 Posibles causas:
          </Typography>
          <Box component="ul" sx={{ textAlign: "left", mt: 1 }}>
            <li>Endpoint incorrecto: <code>/UserDocument</code></li>
            <li>Backend no funcionando en puerto 7245</li>
            <li>Token de autenticación faltante</li>
            <li>CORS mal configurado</li>
          </Box>
          
          <Button 
            variant="contained" 
            onClick={() => refetch()} 
            sx={{ mt: 2 }}
          >
            🔄 Reintentar
          </Button>
        </Paper>
      </div>
    );
  }

  // 🚨 Debug de estructura de datos
  if (!Array.isArray(documents)) {
    return (
      <div className="page">
        <PageHeader title="Gestión de Documentos" />
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "warning.light" }}>
          <Typography variant="h6" color="warning.dark">
            ⚠️ Estructura de datos inesperada
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            El backend devolvió: <code>{typeof documents}</code>
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="caption">
              <strong>Datos recibidos:</strong>
            </Typography>
            <pre style={{ fontSize: '12px', textAlign: 'left' }}>
              {JSON.stringify(documents, null, 2)}
            </pre>
          </Box>
        </Paper>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        title="Gestión de Documentos"
        actions={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => refetch()}
              size="small"
            >
              🔄 Actualizar
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddOutlined />}
              onClick={() => setOpenNew(true)}
            >
              + Nuevo Documento
            </Button>
          </Stack>
        }
        tabs={[
          { label: "Todos", value: "todos" },
          { label: "Públicos", value: "publicos" },
          { label: "Privados", value: "privados" },
        ]}
        selectedTab={tab}
        onTabChange={(v) => setTab(v as typeof tab)}
      />

      {/* 🐛 Debug info mejorado */}
      <Paper sx={{ p: 2, mb: 2, bgcolor: "success.light" }}>
        <Typography variant="subtitle2" color="success.dark">
          ✅ Conexión establecida con /UserDocument
        </Typography>
        <Typography variant="body2">
          • Total documentos: <strong>{totalDocs}</strong>
          • Endpoint: <code>/UserDocument</code>
          • Último refresh: {new Date().toLocaleTimeString()}
        </Typography>
        {totalDocs > 0 && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            💡 Los documentos se están guardando correctamente en la BD
          </Typography>
        )}
      </Paper>

      {/* KPIs simplificados */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="primary.main">
              {totalDocs}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Documentos
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
          <CardContent sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6" color="success.main">
              {publicDocs}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Públicos
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filtros básicos */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar documentos..."
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
            {categories.map(cat => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {/* Tabla actualizada */}
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
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {doc.title || 'Sin título'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.description || 'Sin descripción'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={doc.category || 'Sin categoría'}
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
                      {new Date(doc.createdAt).toLocaleDateString()}
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
                      {totalDocs === 0 
                        ? "🚀 Aún no hay documentos. ¡Crea el primero!" 
                        : "No se encontraron documentos con los filtros aplicados"}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal mejorado */}
      <Dialog open={openNew} onClose={() => setOpenNew(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <NewDocument
            onSuccess={() => {
              setOpenNew(false);
              // Refetch automático después de subir
              setTimeout(() => refetch(), 500);
            }}
            onCancel={() => setOpenNew(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar el documento "{deleteConfirm?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
