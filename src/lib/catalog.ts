import { catalogApi } from "@/lib/catalogApi";

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

const CACHE_PREFIX = "iaas_catalog_";
const PROVINCES_KEY = `${CACHE_PREFIX}provinces_v1`;
const INSTITUTIONS_KEY = `${CACHE_PREFIX}institutions_v1`;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ts: number; data: T };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // Ignorar quota exceeded
  }
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return fn();
  }
}

export async function fetchInstitutions(q?: string): Promise<Institution[]> {
  if (!q) {
    const cached = readCache<Institution[]>(INSTITUTIONS_KEY);
    if (cached?.length) return cached;
  }

  const params = q ? { q, limit: 100 } : { limit: 500 };
  const { data } = await withRetry(() =>
    catalogApi.get<Institution[]>("/catalog/institutions", { params }),
  );

  if (!q && data.length) {
    writeCache(INSTITUTIONS_KEY, data);
  }
  return data;
}

export async function fetchCareers(institutionId: number, q?: string): Promise<Career[]> {
  const params = q ? { q } : undefined;
  const { data } = await withRetry(() =>
    catalogApi.get<Career[]>(`/catalog/institutions/${institutionId}/careers`, { params }),
  );
  return data;
}

export async function fetchProvinces(): Promise<Province[]> {
  const cached = readCache<Province[]>(PROVINCES_KEY);
  if (cached?.length) return cached;

  const { data } = await withRetry(() => catalogApi.get<Province[]>("/catalog/provinces"));
  if (data.length) {
    writeCache(PROVINCES_KEY, data);
  }
  return data;
}

export async function fetchCantons(provinceId: string): Promise<Canton[]> {
  const { data } = await withRetry(() =>
    catalogApi.get<Canton[]>(`/catalog/provinces/${provinceId}/cantons`),
  );
  return data;
}
