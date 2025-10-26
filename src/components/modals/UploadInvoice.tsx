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
import { api } from "../../api/axios";

type FileWithPreview = File & { id: string };

export default function InvoiceUploadForm() {
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

  // --- useMutation para subir factura ---
  const { mutate: uploadInvoice, loading: uploading, error: uploadError } = useMutation(
    "/Invoices/upload",
    "post"
  );

  // OCR: llamada directa porque se hace por archivo, no con hook
  async function callOcrApi(file: File) {
    const form = new FormData();
    form.append("file", file, file.name);

    try {
      setOcrError(null);
      setOcrLoading(true);
      const { data } = await api.post("/Ocr/process-invoice", form);
      return data;
    } catch (err: any) {
      setOcrError(err?.message ?? "Error desconocido en OCR");
      return null;
    } finally {
      setOcrLoading(false);
    }
  }

  function applyOcrResult(data: any) {
    if (!data) return;
    if (data.supplierName) setSupplier(String(data.supplierName).trim());
    if (data.invoiceNumber) setInvoiceNumber(String(data.invoiceNumber).trim());
    if (data.invoiceDate) setIssueDate(formatIsoDateToInput(data.invoiceDate));
    if (data.dueDate) setDueDate(formatIsoDateToInput(data.dueDate));
    if (data.totalAmount) setAmount(String(data.totalAmount));
    if (data.subTotal) setSubTotal(Number(data.subTotal));
    if (data.totalTax) setTotalTax(Number(data.totalTax));
    if (data.cuit) setCuit(String(data.cuit));
    if (data.supplierAddress) setSupplierAddress(String(data.supplierAddress));

    if (Array.isArray(data.items) && data.items.length > 0) {
      const desc = data.items
        .map((it: any) => {
          const d = it.description ?? "";
          const a = it.amount ? Number(it.amount) : null;
          const qty = it.quantity ?? "";
          return a !== null
            ? `${d}${qty ? ` x${qty}` : ""} — ${formatNumber(a)}`
            : `${d}${qty ? ` x${qty}` : ""}`;
        })
        .join(" ; ");
      setDescription((prev) => (prev ? `${prev} ; ${desc}` : desc));
    } else if (data.description) {
      setDescription(String(data.description));
    }
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const mapped = acceptedFiles.map((f) => Object.assign(f, { id: cryptoRandomId() })) as FileWithPreview[];
    setFiles((prev) => [...prev, ...mapped]);

    for (const file of mapped) {
      const data = await callOcrApi(file);
      if (data?.success) applyOcrResult(data);
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

    const payload = new FormData();
    payload.append("concepto", concepto);
    payload.append("categoria", categoria);
    payload.append("invoiceNumber", invoiceNumber);
    payload.append("supplier", supplier);
    payload.append("issueDate", issueDate);
    payload.append("dueDate", dueDate);
    payload.append("amount", String(totalAmount));
    if (subTotal !== null) payload.append("subTotal", String(subTotal));
    if (totalTax !== null) payload.append("totalTax", String(totalTax));
    if (cuit) payload.append("cuit", cuit);
    if (supplierAddress) payload.append("supplierAddress", supplierAddress);
    payload.append("description", description);
    files.forEach((f) => payload.append("files", f, f.name));

    try {
      const resp = await uploadInvoice(payload);
      console.log("Factura subida correctamente", resp);
      resetForm();
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
    setFiles([]);
  };

  const isFormValid =
    concepto.trim() !== "" &&
    categoria.trim() !== "" &&
    invoiceNumber.trim() !== "" &&
    supplier.trim() !== "" &&
    issueDate.trim() !== "" &&
    totalAmount > 0 &&
    files.length > 0 &&
    subTotal !== null &&
    totalTax !== null;

  return (
    <form className="foraria-form" onSubmit={handleSubmit} noValidate>
      <h2 className="foraria-form-title">Cargar Factura</h2>

      {/* Concepto + Categoria */}
      <div className="foraria-form-row" style={{ display: "flex", gap: 16 }}>
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
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        </div>
      </div>

      {/* Número y proveedor */}
      <div className="foraria-form-row" style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="foraria-form-label">Número de factura</label>
          <TextField
            fullWidth
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Ej. 0001-00001234"
            variant="outlined"
            required
          />
        </div>

        <div style={{ flex: 1 }}>
          <label className="foraria-form-label">Proveedor</label>
          <TextField
            fullWidth
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="Nombre del proveedor"
            variant="outlined"
            required
          />
        </div>
      </div>

      {/* Fechas e importes */}
      <div className="foraria-form-row" style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Fecha de emisión</label>
          <TextField
            fullWidth
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
        </div>

        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Importe</label>
          <TextField
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            inputMode="decimal"
            required
          />
        </div>

        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">CUIT</label>
          <TextField fullWidth value={cuit ?? ""} onChange={(e) => setCuit(e.target.value)} />
        </div>
      </div>

      {/* Vencimiento, Subtotal, Impuesto */}
      <div className="foraria-form-row" style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Fecha de vencimiento</label>
          <TextField
            fullWidth
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </div>

        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Sub total</label>
          <TextField
            fullWidth
            value={subTotal !== null ? String(subTotal) : ""}
            onChange={(e) => setSubTotal(e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>

        <div style={{ flex: "1 1 220px" }}>
          <label className="foraria-form-label">Total impuesto</label>
          <TextField
            fullWidth
            value={totalTax !== null ? String(totalTax) : ""}
            onChange={(e) => setTotalTax(e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
      </div>

      {/* Descripción */}
      <div style={{ marginTop: 12 }}>
        <label className="foraria-form-label">Descripción</label>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional: concepto, periodo, notas internas..."
        />
      </div>

      {/* Archivos */}
      <div style={{ marginTop: 12 }}>
        <label className="foraria-form-label">Adjuntar factura (PDF o imagen)</label>
        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed #083D77",
            borderRadius: "8px",
            padding: "16px",
            textAlign: "center",
            backgroundColor: isDragActive ? "#FEFBEF" : "#F2F5F8",
            cursor: "pointer",
            color: "#083D77",
          }}
        >
          <input {...getInputProps()} />
          <Typography>
            {isDragActive ? "Suelta los archivos aquí..." : "Haz clic o arrastra archivos (PDF, JPG, PNG)"}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", marginTop: 1 }}>
            Tamaño máximo por archivo 10 MB
          </Typography>
        </Box>

        {ocrLoading && (
          <Box mt={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2">Procesando OCR...</Typography>
          </Box>
        )}

        {ocrError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Error OCR: {ocrError}
          </Typography>
        )}

        {files.length > 0 && (
          <Box mt={2} sx={{ background: "#fff", padding: 2, borderRadius: 1 }}>
            <Typography variant="subtitle2">Archivos seleccionados</Typography>
            <Stack spacing={1} mt={1}>
              {files.map((file) => (
                <Box
                  key={file.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ borderBottom: "1px solid #E6EDF3", paddingBottom: 1 }}
                >
                  <Box>
                    <Typography component="span" sx={{ fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Typography component="span" sx={{ color: "#6b7280", marginLeft: 1 }}>
                      {formatBytes(file.size)}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => handleRemoveFile(file.id)} aria-label="Eliminar archivo">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </div>

      {/* Botones */}
      <div className="foraria-form-actions" style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={!isFormValid || ocrLoading || uploading}
        >
          {uploading ? "Subiendo..." : "Subir Factura"}
        </Button>
        <Button variant="outlined" onClick={resetForm}>
          Cancelar
        </Button>

        <Box sx={{ marginLeft: "auto", alignSelf: "center" }}>
          <Typography variant="body2" sx={{ color: "#083D77", fontWeight: 600 }}>
            Total declarado: ${totalAmount.toFixed(2)}
          </Typography>
        </Box>
      </div>

      {uploadError && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          Error al subir factura: {uploadError}
        </Typography>
      )}
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

function formatIsoDateToInput(iso?: string) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch {
    return "";
  }
}

function formatNumber(n: number) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
