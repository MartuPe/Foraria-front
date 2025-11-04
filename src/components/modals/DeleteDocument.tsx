import { Box, Button, Typography, Stack } from "@mui/material";
import { DeleteOutline, WarningAmber } from "@mui/icons-material";

interface Document {
  id: number;
  title: string;
  fileName: string;
  downloads: number;
}

interface DeleteDocumentProps {
  document: Document;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDocument({ document, onConfirm, onCancel }: DeleteDocumentProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <WarningAmber color="error" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Eliminar Documento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Archivo: {document.fileName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Descargas: {document.downloads}
        </Typography>
      </Box>

      <Typography variant="body2" sx={{ mb: 3 }}>
        ¿Estás seguro de que deseas eliminar este documento? 
        Se perderá el archivo y todas las estadísticas asociadas.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={onCancel}
          className="foraria-outlined-white-button"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<DeleteOutline />}
          onClick={onConfirm}
        >
          Eliminar
        </Button>
      </Stack>
    </Box>
  );
}
