"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api, getStoredToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import type { UserProfile } from "@/types";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, hydrated, hydrate, setUser, clearAuth } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;

    const storedToken = getStoredToken();
    if (!storedToken) {
      router.replace("/login");
      return;
    }

    async function loadUser() {
      try {
        const { data } = await api.get<UserProfile>("/users/me");
        setUser(data);

        if (
          data.debe_cambiar_password &&
          !pathname.startsWith("/dashboard/settings")
        ) {
          router.replace("/dashboard/settings?forcePassword=1");
        }
      } catch (error) {
        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 403 && pathname.startsWith("/dashboard/settings")) {
          return;
        }
        if (status === 403) {
          router.replace("/dashboard/settings?forcePassword=1");
          return;
        }
        clearAuth();
        router.replace("/login");
      }
    }

    if (!user) {
      void loadUser();
    }
  }, [hydrated, token, user, pathname, router, setUser, clearAuth]);

  const isPasswordSettings = pathname.startsWith("/dashboard/settings");

  if (!hydrated || !getStoredToken()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-iaas-earth">
        Cargando sesión...
      </div>
    );
  }

  if (!user && !isPasswordSettings) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-iaas-earth">
        Cargando sesión...
      </div>
    );
  }

  return <>{children}</>;
}
