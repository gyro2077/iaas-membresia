"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import type { TokenResponse, UserProfile } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: tokenData } = await api.post<TokenResponse>("/auth/login", {
        correo: correo.trim(),
        password,
      });

      if (tokenData.debe_cambiar_password) {
        setAuth(tokenData.access_token, {
          id: "pending",
          fecha_inscripcion: "",
          nombres: "",
          institucion: "",
          carrera: "",
          ciudad: "",
          correo: correo.trim(),
          estado_pago: "",
          fecha_expiracion: "",
          rol: "MEMBER",
          debe_cambiar_password: true,
        });
        router.push("/dashboard/settings?forcePassword=1");
        return;
      }

      const { data: user } = await api.get<UserProfile>("/users/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      setAuth(tokenData.access_token, user);

      if (user.debe_cambiar_password) {
        router.push("/dashboard/settings?forcePassword=1");
      } else if (user.rol === "ADMIN") {
        router.push("/admin/pending");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
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
