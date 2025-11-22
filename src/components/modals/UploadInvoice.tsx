import { useState, useMemo } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDropzone } from "react-dropzone";
import { useMutation } from "../../hooks/useMutation";
import { storage } from "../../utils/storage";
import { getEffectiveIds } from "../../services/userService";
import axios from "axios";

type InvoiceUploadFormProps = {
  onSuccess?: () => void;
};

type FileWithPreview = File & { id: string };

export default function InvoiceUploadForm({ onSuccess }: InvoiceUploadFormProps) {
  const [concepto, setConcepto] = useState("");
  const [categoria, setCategoria] = useState("Gastos");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplier, setSupplier] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [subTotal, setSubTotal] = useState<number | null>(null);
  const [totalTax, setTotalTax] = useState<number | null>(null);
  const [cuit, setCuit] = useState<string | null>(null);
  const [supplierAddress, setSupplierAddress] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [ocrItems, setOcrItems] = useState<any[]>([]); // <--- guardamos items OCR
  const token = localStorage.getItem("accessToken");
  const consortiumId = localStorage.getItem('consortiumId')
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const categoriaOptions = [
    "Mantenimiento",
    "Limpieza",
    "Seguridad",
    "Administracion",
    "Otros",
  ];

  const { mutate: uploadInvoice, loading: uploading, error: uploadError } = useMutation(
    "/Invoice",
    "post"
  );

  // --- OCR ---
  const processInvoiceOCR = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post("https://foraria-api-e7dac8bpewbgdpbj.brazilsouth-01.azurewebsites.net/api/Ocr/process-invoice", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `bearer ${token}` },
      });

      if (!data.success) throw new Error(data.errorMessage || "Error procesando OCR");
      return data;
    } catch (err: any) {
      throw new Error(err.message || "Error de OCR");
    }
  };

  const applyOcrResult = (data: any) => {
    if (!data) return;

    setSupplier(data.supplierName ?? "");
    setCuit(data.cuit ?? "");
    setIssueDate(data.invoiceDate?.split("T")[0] ?? "");
    setDueDate(data.dueDate?.split("T")[0] ?? "");
    setInvoiceNumber(data.invoiceNumber ?? "");
    setSubTotal(data.subTotal ?? null);
    setTotalTax(data.totalTax ?? null);
    setAmount(data.totalAmount ?? 0);
    setSupplierAddress(data.supplierAddress ?? "");

    // Guardamos items completos
    setOcrItems(data.items ?? []);

    // Concatenamos todas las descripciones de los ítems
    if (Array.isArray(data.items) && data.items.length > 0) {
      const allItemsDescription = data.items
        .map((item: any) => item.description)
        .filter(Boolean)
        .join("; ");
      setDescription(allItemsDescription);
    } else if (data.description) {
      setDescription(data.description);
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const mapped = acceptedFiles.map((f) => Object.assign(f, { id: cryptoRandomId() })) as FileWithPreview[];
    setFiles((prev) => [...prev, ...mapped]);

    if (mapped.length === 0) return;

    setOcrLoading(true);
    setOcrError(null);

    try {
      const ocrData = await processInvoiceOCR(mapped[0]); // procesamos solo el primero
      applyOcrResult(ocrData);
    } catch (err: any) {
      setOcrError(err.message);
    } finally {
      setOcrLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [], "image/*": [] },
    multiple: true,
    maxSize: 10 * 1024 * 1024,
  });

  const totalAmount = useMemo(() => {
    const n = parseFloat(String(amount).replace(",", "."));
    return isNaN(n) ? 0 : n;
  }, [amount]);

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

     // Resolver consortiumId de forma robusta
    let consortiumId = storage.consortiumId;
    if (!consortiumId) {
      try {
        const ids = await getEffectiveIds(); // ya lo usás en el dashboard
        consortiumId = ids.consortiumId;
      } catch {
        console.error("No pude resolver el consortiumId");
        return; // o mostrás un toast
      }
    }

    try {
      const payload = {
        concept: concepto,
        category: categoria,
        invoiceNumber: invoiceNumber,
        supplierName: supplier,
        dateOfIssue: issueDate ? new Date(issueDate).toISOString() : new Date().toISOString(),
        expirationDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        amount: totalAmount,
        subTotal: subTotal ?? 0,
        totalTaxes: totalTax ?? 0,
        cuit: cuit ?? "",
        supplierAddress: supplierAddress ?? "",
        description: description,
        filePath: files.length > 0 ? files.map(f => f.name).join(", ") : "sinCargar",
        purchaseOrder: "",
        confidenceScore: 0,
        processedAt: new Date().toISOString(),
        consortiumId: consortiumId,  
        items: ocrItems.length > 0 ? ocrItems : [
          {
            description: description || "Factura",
            amount: totalAmount,
            quantity: 1,
            unitPrice: totalAmount,
          },
        ],
      };

      await uploadInvoice(payload);
      resetForm();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error al subir factura", err);
    }
  };

  const resetForm = () => {
    setConcepto("");
    setCategoria("Gastos");
    setInvoiceNumber("");
    setSupplier("");
    setIssueDate("");
    setDueDate("");
    setAmount("");
    setSubTotal(null);
    setTotalTax(null);
    setCuit(null);
    setSupplierAddress(null);
    setDescription("");
    setOcrItems([]);
    setFiles([]);
    setOcrError(null);
  };

  const isFormValid =
    concepto.trim() !== "" &&
    categoria.trim() !== "" &&
    invoiceNumber.trim() !== "" &&
    supplier.trim() !== "" &&
    issueDate.trim() !== "" &&
    totalAmount > 0;

  return (
    <form className="foraria-form" onSubmit={handleSubmit} noValidate>
      <h2 className="foraria-form-title">Cargar Factura</h2>

      {/* Concepto y Categoría */}
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="foraria-form-label">Concepto</label>
          <TextField
            fullWidth
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej. Compra insumos octubre"
            variant="outlined"
            required
          />
        </div>
        <div style={{ width: 240 }}>
          <label className="foraria-form-label">Categoría</label>
          <TextField
            select
            fullWidth
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            {categoriaOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      {/* Número y proveedor */}
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="foraria-form-label">Número de factura</label>
          <TextField fullWidth value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required/>
        </div>
        <div style={{ flex: 1 }}>
          <label className="foraria-form-label">Proveedor</label>
          <TextField fullWidth value={supplier} onChange={(e) => setSupplier(e.target.value)} required/>
        </div>
      </div>

      {/* Fechas e importe */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Fecha de emisión</label>
          <TextField fullWidth type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} InputLabelProps={{ shrink: true }} required/>
        </div>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Importe</label>
          <TextField fullWidth value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" required/>
        </div>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">CUIT</label>
          <TextField fullWidth value={cuit ?? ""} onChange={(e) => setCuit(e.target.value)} />
        </div>
      </div>

      {/* Vencimiento, subtotal, impuestos */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Fecha de vencimiento</label>
          <TextField fullWidth type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }}/>
        </div>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Sub total</label>
          <TextField fullWidth value={subTotal ?? ""} onChange={(e) => setSubTotal(e.target.value === "" ? null : Number(e.target.value))}/>
        </div>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Total impuesto</label>
          <TextField fullWidth value={totalTax ?? ""} onChange={(e) => setTotalTax(e.target.value === "" ? null : Number(e.target.value))}/>
        </div>
      </div>

      {/* Descripción */}
      <div style={{ marginTop: 12 }}>
        <label className="foraria-form-label">Descripción</label>
        <TextField fullWidth multiline minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional: concepto, periodo, notas internas..." />
      </div>

      {/* Adjuntar factura */}
      <div style={{ marginTop: 12 }}>
        <label className="foraria-form-label">Adjuntar factura (PDF o imagen)</label>
        <Box {...getRootProps()} sx={{ border: "2px dashed #083D77", borderRadius: 2, p: 2, textAlign: "center", backgroundColor: isDragActive ? "#FEFBEF" : "#F2F5F8", cursor: "pointer" }}>
          <input {...getInputProps()} />
          <Typography>{isDragActive ? "Suelta los archivos aquí..." : "Haz clic o arrastra archivos (PDF, JPG, PNG)"}</Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 1 }}>Tamaño máximo por archivo 10 MB</Typography>
        </Box>

        {ocrLoading && <Box mt={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={18}/><Typography variant="body2">Procesando OCR...</Typography></Box>}
        {ocrError && <Typography color="error" variant="body2" sx={{ mt: 1 }}>Error OCR: {ocrError}</Typography>}

        {files.length > 0 && (
          <Box mt={2} sx={{ background: "#fff", p: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2">Archivos seleccionados</Typography>
            <Stack spacing={1} mt={1}>
              {files.map((file) => (
                <Box key={file.id} display="flex" alignItems="center" justifyContent="space-between" sx={{ borderBottom: "1px solid #E6EDF3", pb: 1 }}>
                  <Box>
                    <Typography component="span" sx={{ fontWeight: 500 }}>{file.name}</Typography>
                    <Typography component="span" sx={{ color: "#6b7280", ml: 1 }}>{formatBytes(file.size)}</Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveFile(file.id)}><DeleteIcon fontSize="small"/></IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: 12 }}>
        <Button type="submit" variant="contained" color="primary" disabled={!isFormValid || ocrLoading || uploading}>{uploading ? "Subiendo..." : "Subir Factura"}</Button>
        <Button variant="outlined" onClick={resetForm}>Cancelar</Button>
        <Box sx={{ ml: "auto", alignSelf: "center" }}><Typography variant="body2" sx={{ color: "#083D77", fontWeight: 600 }}>Total declarado: ${totalAmount.toFixed(2)}</Typography></Box>
      </div>

      {uploadError && <Typography color="error" variant="body2" sx={{ mt: 1 }}>Error al subir factura: {uploadError}</Typography>}
    </form>
  );
}

/* Helpers */
function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function cryptoRandomId() {
  if (typeof (globalThis as any).crypto?.randomUUID === "function") {
    return (globalThis as any).crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 9);
}
