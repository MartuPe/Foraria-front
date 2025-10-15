// src/services/supplierService.ts
import { api } from "../api/axios";

// Tipado base
export interface Supplier {
  id?: number;
  commercialName: string;
  businessName: string;
  cuit: string;
  supplierCategory: string;
  phone?: string;
  email?: string;
  address?: string;
  contactPerson?: string;
  observations?: string;
  active?: boolean;
  registrationDate?: string;
}

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    try {
      const { data } = await api.get("/Supplier");
      return data;
    } catch (err) {
      console.error("❌ Error al obtener proveedores:", err);
      throw err;
    }
  },

  async getById(id: number): Promise<Supplier> {
    try {
      const { data } = await api.get(`/Supplier/${id}`);
      return data;
    } catch (err) {
      console.error(`❌ Error al obtener proveedor ID ${id}:`, err);
      throw err;
    }
  },

  async create(supplier: Supplier): Promise<Supplier> {
    try {
      const { data } = await api.post("/Supplier", supplier);
      return data;
    } catch (err) {
      console.error("❌ Error al crear proveedor:", err);
      throw err;
    }
  },

  async remove(id: number): Promise<void> {
    try {
      await api.delete(`/Supplier/${id}`);
    } catch (err) {
      console.error(`❌ Error al eliminar proveedor ID ${id}:`, err);
      throw err;
    }
  }
};

export {};
