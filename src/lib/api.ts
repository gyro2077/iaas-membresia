import axios from "axios";

import { logoutAndRedirect, triggerLogout } from "@/lib/authSession";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const TOKEN_KEY = "iaas_token";

const baseURL = getApiBaseUrl();

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  if (baseURL.startsWith("http://127.0.0.1") || baseURL.startsWith("http://localhost")) {
    console.error(
      "NEXT_PUBLIC_API_URL apunta a localhost en producción. Usa /api/v1 o el proxy del backend.",
    );
  }
}

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    if (isPublicEndpoint(config.url)) {
      return config;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function isPublicEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/catalog/") || url.includes("/membership/status");
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/auth/login") || url.includes("/auth/register");
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string | undefined = error.config?.url;

    if (status === 401 && typeof window !== "undefined" && !isAuthEndpoint(requestUrl) && !isPublicEndpoint(requestUrl)) {
      if (!window.location.pathname.startsWith("/login")) {
        logoutAndRedirect("/login");
      } else {
        triggerLogout();
      }
    }

    return Promise.reject(error);
  },
);

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
