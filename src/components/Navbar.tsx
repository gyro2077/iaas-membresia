"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, LogOut, Shield, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selectIsAdmin, useAuth } from "@/store/useAuth";

export function Navbar() {
  const pathname = usePathname();
  const { user, token, hydrated, clearAuth } = useAuth();
  const isAdmin = useAuth(selectIsAdmin);

  function handleLogout() {
    clearAuth();
    window.location.href = "/";
  }

  return (
    <header className="border-b border-iaas-earth/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-iaas-green">
          <Leaf className="h-6 w-6" />
          <span>IAAS Membresías</span>
        </Link>

        <nav className="flex items-center gap-2 text-sm">
          {hydrated && !token && (
            <>
              <Link
                href="/login"
                className={cn(
                  "rounded-lg px-3 py-2 hover:bg-iaas-light",
                  pathname === "/login" && "bg-iaas-light text-iaas-green",
                )}
              >
                Ingresar
              </Link>
              <Link href="/register">
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}

          {hydrated && token && user && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-iaas-light",
                  pathname.startsWith("/dashboard") && "bg-iaas-light text-iaas-green",
                )}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/pending"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 hover:bg-iaas-light",
                    pathname.startsWith("/admin") && "bg-iaas-light text-iaas-green",
                  )}
                >
                  <Shield className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-1 h-4 w-4" />
                Salir
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
