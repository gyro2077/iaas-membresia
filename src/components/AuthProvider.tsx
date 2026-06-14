"use client";

import { useEffect } from "react";

import { registerLogoutHandler } from "@/lib/authSession";
import { useAuth } from "@/store/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuth((state) => state.hydrate);
  const clearAuth = useAuth((state) => state.clearAuth);

  useEffect(() => {
    hydrate();
    registerLogoutHandler(clearAuth);
  }, [hydrate, clearAuth]);

  return <>{children}</>;
}
