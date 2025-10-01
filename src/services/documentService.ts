// src/services/documentService.ts
export type GeneralCategory =
  | "Reglamentos"
  | "Actas"
  | "Presupuestos"
  | "Planos"
  | "Seguros"
  | "Manuales"
  | "Emergencias"
  | "Mantenimiento";

export type MyCategory =
  | "Escrituras"
  | "Comprobantes"
  | "Autorizaciones"
  | "Certificados"
  | "Reclamos"
  | "Contratos";

export interface DocBase {
  id: string;
  title: string;
  description: string;
  sizeKB: number;     // en KB
  date: string;       // yyyy-mm-dd
  url?: string;       // mock
  downloadsThisMonth?: number;
}

export interface GeneralDoc extends DocBase {
  category: GeneralCategory;
}

export interface MyDoc extends DocBase {
  category: MyCategory;
}

export const GENERAL_DOCS: GeneralDoc[] = [
  {
    id: "g-1",
    title: "Reglamento de Copropiedad 2024",
    description: "Reglamento interno actualizado con las nuevas normativas aprobadas en asamblea",
    sizeKB: 2500,
    date: "2024-11-15",
    category: "Reglamentos",
    url: "#",
  },
  {
    id: "g-2",
    title: "Acta Asamblea Ordinaria - Octubre 2024",
    description: "Acta de la asamblea ordinaria donde se aprobó la renovación de la pileta",
    sizeKB: 1800,
    date: "2024-10-28",
    category: "Actas",
    url: "#",
  },
  {
    id: "g-3",
    title: "Presupuesto Anual 2025",
    description: "Detalle del presupuesto proyectado para el año 2025",
    sizeKB: 890,
    date: "2024-11-10",
    category: "Presupuestos",
    url: "#",
  },
  {
    id: "g-4",
    title: "Planos del Edificio",
    description: "Planos arquitectónicos actualizados del edificio",
    sizeKB: 5200,
    date: "2024-11-05",
    category: "Planos",
    url: "#",
  },
  {
    id: "g-5",
    title: "Seguro del Edificio - Póliza 2024",
    description: "Póliza de seguro contra incendio y responsabilidad civil",
    sizeKB: 1200,
    date: "2024-11-01",
    category: "Seguros",
    url: "#",
  },
  {
    id: "g-6",
    title: "Manual de Uso de Espacios Comunes",
    description: "Guía de uso y reserva de pileta, SUM, parrilla y otros espacios",
    sizeKB: 3100,
    date: "2024-10-25",
    category: "Manuales",
    url: "#",
  },
  {
    id: "g-7",
    title: "Contactos de Emergencia",
    description: "Lista de contactos de bomberos, policía, hospital y servicios de emergencia",
    sizeKB: 450,
    date: "2024-10-20",
    category: "Emergencias",
    url: "#",
  },
  {
    id: "g-8",
    title: "Procedimientos de Mantenimiento",
    description: "Protocolos de mantenimiento preventivo y correctivo",
    sizeKB: 1500,
    date: "2024-10-18",
    category: "Mantenimiento",
    url: "#",
  },
];

export const MY_DOCS_SEED: MyDoc[] = [
  {
    id: "m-1",
    title: "Escritura Depto 4B",
    description: "Escritura de propiedad del departamento 4B",
    sizeKB: 2800,
    date: "2024-03-12",
    category: "Escrituras",
  },
  {
    id: "m-2",
    title: "Comprobante Pago Expensa Nov 2024",
    description: "Recibo de pago de expensa correspondiente a noviembre 2024",
    sizeKB: 320,
    date: "2024-11-05",
    category: "Comprobantes",
  },
  {
    id: "m-3",
    title: "Autorización Obra Cocina",
    description: "Autorización del consorcio para renovación de cocina",
    sizeKB: 1100,
    date: "2024-11-08",
    category: "Autorizaciones",
  },
  {
    id: "m-4",
    title: "Certificado Libre Deuda",
    description: "Certificado de libre deuda emitido por administración",
    sizeKB: 180,
    date: "2024-11-05",
    category: "Certificados",
  },
  {
    id: "m-5",
    title: "Fotos Daño Balcón",
    description: "Evidencia fotográfica del daño en barandas del balcón",
    sizeKB: 2500,
    date: "2024-10-28",
    category: "Reclamos",
  },
  {
    id: "m-6",
    title: "Contrato Locación Cochera",
    description: "Contrato de locación de cochera cubierta N°12",
    sizeKB: 890,
    date: "2024-10-28",
    category: "Contratos",
  },
];

export function formatSize(sizeKB: number) {
  return sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
}

export function formatDate(iso: string) {
  // 2024-11-15 -> 15 Nov 2024
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString("es-AR", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function countByCategory<T extends { category: string }>(
  docs: T[]
): Record<string, number> {
  return docs.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
