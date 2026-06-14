"use client";

import { FormEvent, useState } from "react";
import { LogIn, Search, ShieldCheck, ShieldX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { MembershipStatus } from "@/types";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MembershipStatus | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data } = await api.post<MembershipStatus>("/membership/status", {
        identifier: email.trim(),
      });
      setResult(data);
    } catch {
      setError("No encontramos una membresía con ese correo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <section className="mb-10 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-iaas-earth">
          Consulta pública
        </p>
        <h1 className="text-4xl font-bold text-iaas-green md:text-5xl">
          Verifica tu membresía IAAS
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-iaas-earth/90">
          Ingresa tu correo institucional para conocer el estado de tu membresía sin necesidad de
          iniciar sesión.
        </p>

        <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              Iniciar sesión
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full">
              Registrarme
            </Button>
          </Link>
        </div>

        <p className="mx-auto mt-4 max-w-2xl rounded-lg bg-iaas-light px-4 py-2 text-sm text-iaas-green">
          ¿Primera vez? Usa la contraseña temporal <strong>IAAS2026!</strong> al ingresar — deberás
          cambiarla en tu primer acceso.
        </p>
      </section>

      <Card className="mx-auto max-w-2xl">
        <CardTitle>Consulta rápida</CardTitle>
        <CardDescription>Solo necesitas tu correo electrónico registrado.</CardDescription>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            type="email"
            required
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Consultando..." : "Consultar estado"}
          </Button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {result && (
          <div
            className={`mt-6 rounded-2xl border p-5 ${
              result.active
                ? "border-iaas-green/30 bg-iaas-light"
                : "border-red-200 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {result.active ? (
                <ShieldCheck className="h-8 w-8 text-iaas-green" />
              ) : (
                <ShieldX className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="text-lg font-semibold">
                  {result.active ? "Membresía activa" : "Membresía no activa"}
                </p>
                <p className="text-sm text-iaas-earth">
                  Miembro: <strong>{result.masked_name}</strong>
                </p>
                <p className="text-sm text-iaas-earth">Estado: {result.status}</p>
                <p className="text-sm text-iaas-earth">
                  Expira: {formatDate(result.expires_at)}
                </p>
                <p className="text-sm text-iaas-earth">
                  Días restantes: {result.days_remaining}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
        <Link href="/login" className="text-iaas-green underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
        <span className="text-iaas-earth/40">•</span>
        <Link href="/register" className="text-iaas-green underline-offset-4 hover:underline">
          Registrarme como nuevo miembro
        </Link>
      </div>
    </div>
  );
}
