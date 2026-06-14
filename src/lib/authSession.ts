import { clearStoredToken } from "@/lib/api";

type LogoutHandler = () => void;

const LOGOUT_FLAG_KEY = "iaas_logging_out";

let logoutHandler: LogoutHandler | null = null;

export function registerLogoutHandler(handler: LogoutHandler) {
  logoutHandler = handler;
}

export function triggerLogout() {
  logoutHandler?.();
}

/** Cierra sesión por completo y recarga la app en la ruta indicada. */
export function logoutAndRedirect(redirectTo = "/login?logout=1") {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(LOGOUT_FLAG_KEY, "1");
  }

  clearStoredToken();
  logoutHandler?.();

  if (typeof window !== "undefined") {
    window.location.href = redirectTo;
  }
}

export function consumeLogoutFlag(): boolean {
  if (typeof window === "undefined") return false;
  const active = sessionStorage.getItem(LOGOUT_FLAG_KEY) === "1";
  if (active) {
    sessionStorage.removeItem(LOGOUT_FLAG_KEY);
  }
  return active;
}
