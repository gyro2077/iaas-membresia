import { api } from "@/lib/api";

export interface Institution {
  id: number;
  name: string;
  is_military: boolean;
  alias: string | null;
}

export interface Career {
  id: number;
  name: string;
}

export interface Province {
  id: string;
  name: string;
}

export interface Canton {
  id: string;
  name: string;
}

export async function fetchInstitutions(q?: string): Promise<Institution[]> {
  const params = q ? { q, limit: 500 } : { limit: 500 };
  const { data } = await api.get<Institution[]>("/catalog/institutions", { params });
  return data;
}

export async function fetchCareers(institutionId: number): Promise<Career[]> {
  const { data } = await api.get<Career[]>(`/catalog/institutions/${institutionId}/careers`);
  return data;
}

export async function fetchProvinces(): Promise<Province[]> {
  const { data } = await api.get<Province[]>("/catalog/provinces");
  return data;
}

export async function fetchCantons(provinceId: string): Promise<Canton[]> {
  const { data } = await api.get<Canton[]>(`/catalog/provinces/${provinceId}/cantons`);
  return data;
}
