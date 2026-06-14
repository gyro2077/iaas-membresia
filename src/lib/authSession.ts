import { clearStoredToken } from "@/lib/api";

type LogoutHandler = () => void;

let logoutHandler: LogoutHandler | null = null;

export function registerLogoutHandler(handler: LogoutHandler) {
  logoutHandler = handler;
}

export function triggerLogout() {
  logoutHandler?.();
}

/** Cierra sesión por completo y recarga la app en la ruta indicada. */
export function logoutAndRedirect(redirectTo = "/") {
  clearStoredToken();
  logoutHandler?.();

  if (typeof window !== "undefined") {
    window.location.replace(redirectTo);
  }
}
