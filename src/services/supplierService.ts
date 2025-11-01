// src/services/supplierService.ts
import { api } from "../api/axios";

export interface Supplier {
  id?: number;
  commercialName: string;
  businessName: string;
  cuit: string;
  supplierCategory: string; // el DTO del back la expone 'supplierCategory' (binding case-insensitive)
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  observations?: string;
  consortiumId: number;     // ← OBLIGATORIO para POST
  active?: boolean;
  registrationDate?: string;
}

// Tipo para creación: opcionalmente Omit
export type CreateSupplier = Omit<Supplier, "id" | "active" | "registrationDate">;

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const { data } = await api.get("/Supplier");
    return data;
  },

  async getById(id: number): Promise<Supplier> {
    const { data } = await api.get(`/Supplier/${id}`);
    return data;
  },

  async create(supplier: CreateSupplier): Promise<Supplier> {
    try {
      const { data } = await api.post("/Supplier", supplier);
      return data; // SupplierResponseDto
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error(" Supplier API create error:", status, body ?? err?.message);
      throw err;
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`/Supplier/${id}`); // back devuelve 204
    } catch (err: any) {
      const status = err?.response?.status;
      const body = err?.response?.data;
      console.error(" Supplier API delete error:", status, body ?? err?.message);
      throw err;
    }
  }
};

export {};
