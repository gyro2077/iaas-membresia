"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { PaymentInfo } from "@/components/PaymentInfo";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/store/useAuth";
import type { RenewResponse } from "@/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isActive = user.estado_pago === "ACTIVO";

  function handleFileChange(selected: File | null) {
    setError(null);
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP.");
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setError("La imagen no puede superar 5 MB.");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  async function handleRenew(event: FormEvent) {
    event.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const body = new FormData();
      body.append("correo", user.correo);
      body.append("file", file);

      const { data } = await api.post<RenewResponse>("/membership/renew", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(data.message);
      setUser({ ...user, estado_pago: "PENDIENTE" });
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "No se pudo subir el comprobante. Intenta nuevamente.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-iaas-green">Mi dashboard</h1>
        <p className="text-iaas-earth">Bienvenido, {user.nombres}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardTitle>Estado de membresía</CardTitle>
          <CardDescription>Tu cuenta permanece activa aunque la membresía expire.</CardDescription>
          <div
            className={`mt-4 rounded-xl p-4 ${
              isActive ? "bg-iaas-light text-iaas-green" : "bg-red-50 text-red-700"
            }`}
          >
            <p className="font-semibold">{isActive ? "Membresía activa" : `Estado: ${user.estado_pago}`}</p>
            <p className="mt-2 text-sm">Expira: {formatDate(user.fecha_expiracion)}</p>
          </div>
          <Link href="/dashboard/settings" className="mt-4 inline-block text-sm text-iaas-green hover:underline">
            Editar perfil y contraseña →
          </Link>
        </Card>

        <Card>
          <CardTitle>Renovar membresía</CardTitle>
          <CardDescription>Sube tu comprobante de pago para iniciar la revisión.</CardDescription>
          <PaymentInfo />
          <form onSubmit={handleRenew} className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-iaas-earth">
                Comprobante de pago de la membresía
              </label>
              <p className="mb-3 text-xs text-iaas-earth/80">
                Solo imágenes JPG, PNG o WEBP (máx. 5 MB).
              </p>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-iaas-earth/20 bg-white px-4 py-8 hover:border-iaas-green/40 hover:bg-iaas-light/50">
                <Upload className="mb-2 h-8 w-8 text-iaas-green" />
                <span className="text-sm text-iaas-earth">
                  {file ? file.name : "Haz clic para subir tu comprobante"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {previewUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewUrl}
                  alt="Vista previa del comprobante"
                  className="mt-4 max-h-48 rounded-lg border border-iaas-earth/10 object-contain"
                />
              )}
            </div>
            {message && <p className="text-sm text-iaas-green">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading || !file}>
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Subiendo..." : "Enviar comprobante"}
            </Button>
          </form>
        </Card>
      </div>

      <Card>
        <CardTitle>Datos del perfil</CardTitle>
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
          <div><dt className="text-iaas-earth">Correo</dt><dd className="font-medium">{user.correo}</dd></div>
          <div><dt className="text-iaas-earth">Institución</dt><dd className="font-medium">{user.institucion}</dd></div>
          <div><dt className="text-iaas-earth">Carrera</dt><dd className="font-medium">{user.carrera}</dd></div>
          <div><dt className="text-iaas-earth">Ciudad</dt><dd className="font-medium">{user.ciudad}</dd></div>
        </dl>
      </Card>
    </div>
  );
}
