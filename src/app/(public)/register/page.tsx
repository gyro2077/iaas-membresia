"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    correo: "",
    password: "",
    nombres: "",
    institucion: "",
    carrera: "",
    ciudad: "",
  });
  const [file, setFile] = useState<File | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value.trim()));
      if (file) body.append("file", file);

      await api.post("/auth/register", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Cuenta creada. Ahora puedes iniciar sesión.");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("No se pudo completar el registro. Verifica que el correo no esté en uso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardTitle>Registro de nuevo miembro</CardTitle>
        <CardDescription>
          Crea tu cuenta IAAS. Puedes adjuntar tu comprobante de pago opcionalmente.
        </CardDescription>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-iaas-earth">Correo</label>
            <Input type="email" required value={form.correo} onChange={(e) => updateField("correo", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-iaas-earth">Contraseña (mín. 8 caracteres)</label>
            <Input type="password" required minLength={8} value={form.password} onChange={(e) => updateField("password", e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-iaas-earth">Nombres completos</label>
            <Input required value={form.nombres} onChange={(e) => updateField("nombres", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Institución</label>
            <Input required value={form.institucion} onChange={(e) => updateField("institucion", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Carrera</label>
            <Input required value={form.carrera} onChange={(e) => updateField("carrera", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Ciudad</label>
            <Input required value={form.ciudad} onChange={(e) => updateField("ciudad", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Comprobante (opcional)</label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
          <div className="md:col-span-2">
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            {success && <p className="mb-3 text-sm text-iaas-green">{success}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registrando..." : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-iaas-earth">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-iaas-green hover:underline">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
