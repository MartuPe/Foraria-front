import { api } from "../api/axios";

export type RegisterUserPayload = {
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: number;
  RoleId: number;
  ResidenceId: number;
};

export async function registerUser(payload: RegisterUserPayload) {
  const { data } = await api.post("/User/register", payload);
  return data;
}
