type LogoutHandler = () => void;

let logoutHandler: LogoutHandler | null = null;

export function registerLogoutHandler(handler: LogoutHandler) {
  logoutHandler = handler;
}

export function triggerLogout() {
  logoutHandler?.();
}
