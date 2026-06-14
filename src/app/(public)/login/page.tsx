"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, setStoredToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import type { TokenResponse, UserProfile } from "@/types";

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return "Correo o contraseña incorrectos.";
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, clearAuth, token } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAuth();
  }, [clearAuth]);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: tokenData } = await api.post<TokenResponse>("/auth/login", {
        correo: correo.trim(),
        password,
      });

      setStoredToken(tokenData.access_token);

      const { data: user } = await api.get<UserProfile>("/users/me");
      setAuth(tokenData.access_token, user);

      if (user.debe_cambiar_password || tokenData.debe_cambiar_password) {
        router.push("/dashboard/settings?forcePassword=1");
      } else if (user.rol === "ADMIN") {
        router.push("/admin/pending");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-12">
      <div className="rounded-xl border border-iaas-accent/40 bg-yellow-50 px-4 py-4 text-sm text-yellow-950">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-iaas-accent" />
          <div>
            <p className="font-semibold">Primer acceso — contraseña temporal</p>
            <p className="mt-1 leading-relaxed">
              Miembros: contraseña temporal <strong>IAAS2026!</strong> (deberás cambiarla al
              entrar). Administradores: <strong>AdminIAAS2026!</strong>
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>Accede a tu panel de miembro IAAS.</CardDescription>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Correo</label>
            <Input
              type="email"
              required
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Contraseña</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-iaas-light px-3 py-3 text-xs text-iaas-earth">
          <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-iaas-green" />
          <p>
            Tras iniciar sesión por primera vez, serás redirigido automáticamente para cambiar tu
            contraseña antes de acceder al dashboard.
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-iaas-earth">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-iaas-green hover:underline">
            Regístrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
