import axios from "axios";

import { triggerLogout } from "@/lib/authSession";

const TOKEN_KEY = "iaas_token";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error(
      "NEXT_PUBLIC_API_URL no está configurada. Las peticiones irán a localhost.",
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
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes("/auth/login") || url.includes("/auth/register");
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl: string | undefined = error.config?.url;

    if (status === 401 && typeof window !== "undefined" && !isAuthEndpoint(requestUrl)) {
      triggerLogout();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
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
