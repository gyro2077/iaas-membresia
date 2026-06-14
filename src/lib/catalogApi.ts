import axios from "axios";

import { getApiBaseUrl } from "@/lib/apiBaseUrl";

/** Cliente público para catálogos: sin token JWT (evita 401 en registro). */
export const catalogApi = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 45000,
  headers: {
    "Content-Type": "application/json",
  },
});
