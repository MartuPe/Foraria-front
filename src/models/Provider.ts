export interface Provider {
  id: number;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
