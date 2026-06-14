"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { selectIsAdmin, useAuth } from "@/store/useAuth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAdmin = useAuth(selectIsAdmin);
  const { user, hydrated } = useAuth();

  useEffect(() => {
    if (hydrated && user && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [hydrated, user, isAdmin, router]);

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-iaas-earth">
        Verificando permisos de administrador...
      </div>
    );
  }

  return <>{children}</>;
}
