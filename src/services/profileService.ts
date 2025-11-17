import { api } from "../api/axios";
import { storage } from "../utils/storage";
import type { UserProfile, ResidenceDto } from "./userService";

type ApiUserDto = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  dni?: number | null;
  roleId: number;
  roleDescription: string;
  photo?: string | null;
  residenceId?: number | null;
  floor?: number | null;
  numberFloor?: number | null;
  consortiumId?: number | null;
  success?: boolean;
};

function mapApiUserToProfile(dto: ApiUserDto): UserProfile {
  const residences: ResidenceDto[] = dto.residenceId ? [
    {
      id: dto.residenceId,
      floor: dto.floor ?? null,
      number: dto.numberFloor ?? null,
      consortiumId: dto.consortiumId ?? 0,
    },
  ] : [];

  return {
    id: dto.id,
    firstName: dto.firstName ?? "",
    lastName: dto.lastName ?? "",
    email: dto.email ?? "",
    phoneNumber: dto.phoneNumber ?? null,
    dni: dto.dni ?? null,
    role: (dto.roleDescription as any) ?? "",
    consortiumId: dto.consortiumId ?? null,
    photo: dto.photo ?? null,
    residences,
    hasPermission: undefined,
  };
}

let cachedProfile: UserProfile | null = null;

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const userId =
      storage.userId ??
      (storage.user && (storage.user as any).id ? Number((storage.user as any).id) : null);

    if (!userId) {
      throw new Error("No hay userId en storage para obtener el perfil.");
    }
    if (cachedProfile && cachedProfile.id === userId) {
      return cachedProfile;
    }

    const { data } = await api.get<ApiUserDto>("/User", { params: { id: userId } });
    const profile = mapApiUserToProfile(data);
    cachedProfile = profile;

    storage.userId = profile.id;
    if (profile.consortiumId != null) {
      storage.consortiumId = profile.consortiumId;
    }
    if (profile.residences && profile.residences[0]) {
      storage.residenceId = profile.residences[0].id;
    }

    return profile;
  },
};