"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { api, getStoredToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import type { UserProfile } from "@/types";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, hydrated, setUser, clearAuth } = useAuth();
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (!hydrated) return;

    const storedToken = getStoredToken();
    if (!storedToken || !token) {
      setLoadingUser(false);
      router.replace("/login");
      return;
    }

    if (user) {
      setLoadingUser(false);
      if (user.debe_cambiar_password && !pathname.startsWith("/dashboard/settings")) {
        router.replace("/dashboard/settings?forcePassword=1");
      }
      return;
    }

    let cancelled = false;

    async function loadUser() {
      setLoadingUser(true);
      try {
        const { data } = await api.get<UserProfile>("/users/me");
        if (cancelled) return;

        setUser(data);

        if (data.debe_cambiar_password && !pathname.startsWith("/dashboard/settings")) {
          router.replace("/dashboard/settings?forcePassword=1");
        }
      } catch (error) {
        if (cancelled) return;

        const status = (error as { response?: { status?: number } }).response?.status;
        if (status === 401) {
          clearAuth();
          router.replace("/login");
          return;
        }
        if (status === 403 && !pathname.startsWith("/dashboard/settings")) {
          router.replace("/dashboard/settings?forcePassword=1");
          return;
        }
        clearAuth();
        router.replace("/login");
      } finally {
        if (!cancelled) setLoadingUser(false);
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, [hydrated, token, user, pathname, router, setUser, clearAuth]);

  if (!hydrated || !getStoredToken() || !token || loadingUser || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-iaas-earth">
        Cargando sesión...
      </div>
    );
  }

  return <>{children}</>;
}
