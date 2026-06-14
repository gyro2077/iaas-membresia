"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, CheckCircle2, Upload } from "lucide-react";
import axios from "axios";

import { CatalogSelect } from "@/components/CatalogSelect";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PaymentInfo } from "@/components/PaymentInfo";
import { api } from "@/lib/api";
import {
  fetchCantons,
  fetchCareers,
  fetchInstitutions,
  fetchProvinces,
  type Career,
  type Institution,
  type Province,
} from "@/lib/catalog";
import type { RegisterResponse } from "@/types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function attendedPositive(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized.startsWith("sí") || normalized.startsWith("si");
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    correo: "",
    nombres: "",
    fecha_nacimiento: "",
    telefono: "",
    motivacion: "",
    expectativas: "",
    asistio_evento: "",
    evento_parte_favorita: "",
    evento_mejora: "",
  });
  const [institutionId, setInstitutionId] = useState("");
  const [careerId, setCareerId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<{ id: string; name: string }[]>([]);
  const [provincesLoading, setProvincesLoading] = useState(true);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);
  const [careersLoading, setCareersLoading] = useState(false);
  const [cantonsLoading, setCantonsLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    void fetchProvinces()
      .then(setProvinces)
      .catch(() => setCatalogError((prev) => prev ?? "No se pudieron cargar las provincias."))
      .finally(() => setProvincesLoading(false));

    void fetchInstitutions()
      .then(setInstitutions)
      .catch(() =>
        setCatalogError((prev) => prev ?? "No se pudieron cargar las instituciones."),
      )
      .finally(() => setInstitutionsLoading(false));
  }, []);

  useEffect(() => {
    if (!institutionId) {
      setCareers([]);
      setCareerId("");
      return;
    }
    setCareers([]);
    setCareersLoading(true);
    void fetchCareers(Number(institutionId))
      .then(setCareers)
      .catch(() => setCatalogError("No se pudieron cargar las carreras."))
      .finally(() => setCareersLoading(false));
  }, [institutionId]);

  useEffect(() => {
    if (!provinceId) {
      setCantons([]);
      setCantonId("");
      return;
    }
    setCantons([]);
    setCantonsLoading(true);
    void fetchCantons(provinceId)
      .then(setCantons)
      .catch(() => setCatalogError("No se pudieron cargar los cantones."))
      .finally(() => setCantonsLoading(false));
  }, [provinceId]);

  const showEventDetails = useMemo(
    () => attendedPositive(form.asistio_evento),
    [form.asistio_evento],
  );

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Debes adjuntar el comprobante de pago.");
      setLoading(false);
      return;
    }

    if (!institutionId || !careerId || !provinceId || !cantonId) {
      setError("Selecciona institución, carrera, provincia y cantón.");
      setLoading(false);
      return;
    }

    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (!showEventDetails && (key === "evento_parte_favorita" || key === "evento_mejora")) {
          return;
        }
        body.append(key, value.trim());
      });
      body.append("institution_id", institutionId);
      body.append("career_id", careerId);
      body.append("province_id", provinceId);
      body.append("canton_id", cantonId);
      body.append("file", file);

      const { data } = await api.post<RegisterResponse>("/auth/register", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(data.message);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "No se pudo completar el registro. Verifica los datos e intenta de nuevo.";
      setError(detail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <section className="text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-iaas-earth">
          Interesados IAAS EC 2026
        </p>
        <h1 className="mt-2 text-3xl font-bold text-iaas-green md:text-4xl">
          Únete a IAAS Ecuador
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-iaas-earth/90">
          Asociación Internacional de Estudiantes de Ciencias Agrícolas y Afines (IAAS). Únete a
          nuestra comunidad, participa de talleres y eventos nacionales e internacionales, accede a
          oportunidades de intercambio y pasantías y conecta con estudiantes y profesionales en todo
          el mundo.
        </p>
      </section>

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">{success}</p>
            <p className="mt-1">Redirigiendo al inicio de sesión...</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Todos los campos marcados son obligatorios.</CardDescription>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-iaas-earth">Email *</label>
              <Input
                type="email"
                required
                value={form.correo}
                onChange={(e) => updateField("correo", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-iaas-earth">Nombre completo *</label>
              <Input
                required
                value={form.nombres}
                onChange={(e) => updateField("nombres", e.target.value)}
              />
            </div>
            <div>
              <CatalogSelect
                label="Universidad, instituto o institución"
                required
                loading={institutionsLoading}
                value={institutionId}
                onChange={(value) => {
                  setInstitutionId(value);
                  setCareerId("");
                }}
                placeholder="Selecciona tu institución"
                options={institutions.map((item) => ({
                  id: String(item.id),
                  label: item.alias ? `${item.name} (${item.alias})` : item.name,
                }))}
              />
            </div>
            <div>
              <CatalogSelect
                label="Carrera u ocupación"
                required
                loading={careersLoading}
                disabled={!institutionId}
                value={careerId}
                onChange={setCareerId}
                placeholder={
                  institutionId ? "Selecciona tu carrera" : "Primero elige una institución"
                }
                emptyLabel="No hay carreras registradas para esta institución"
                options={careers.map((item) => ({
                  id: String(item.id),
                  label: item.name,
                }))}
              />
            </div>
            <div>
              <CatalogSelect
                label="Provincia"
                required
                loading={provincesLoading}
                value={provinceId}
                onChange={(value) => {
                  setProvinceId(value);
                  setCantonId("");
                }}
                placeholder="Selecciona tu provincia"
                options={provinces.map((item) => ({
                  id: item.id,
                  label: item.name,
                }))}
              />
            </div>
            <div>
              <CatalogSelect
                label="Cantón / ciudad"
                required
                loading={cantonsLoading}
                disabled={!provinceId}
                value={cantonId}
                onChange={setCantonId}
                placeholder={provinceId ? "Selecciona tu cantón" : "Primero elige una provincia"}
                options={cantons.map((item) => ({
                  id: item.id,
                  label: item.name,
                }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Fecha de nacimiento *</label>
              <Input
                type="date"
                required
                value={form.fecha_nacimiento}
                onChange={(e) => updateField("fecha_nacimiento", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-iaas-earth">Número de teléfono *</label>
              <Input
                type="tel"
                required
                placeholder="+593991234567"
                value={form.telefono}
                onChange={(e) => updateField("telefono", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Motivación e interés</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">
                Motivación para entrar a IAAS *
              </label>
              <textarea
                required
                minLength={10}
                rows={4}
                className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20"
                value={form.motivacion}
                onChange={(e) => updateField("motivacion", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">
                ¿Qué esperas aprender o desarrollar con IAAS? *
              </label>
              <textarea
                required
                minLength={10}
                rows={4}
                className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20"
                value={form.expectativas}
                onChange={(e) => updateField("expectativas", e.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Experiencia en eventos IAAS</CardTitle>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">
                ¿Has asistido a algún evento con nosotros? Si tu respuesta es positiva, indica cuál
                fue la parte que más te gustó *
              </label>
              <textarea
                required
                minLength={10}
                rows={3}
                placeholder="Ej: Sí, asistí al encuentro virtual 2025..."
                className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20"
                value={form.asistio_evento}
                onChange={(e) => updateField("asistio_evento", e.target.value)}
              />
            </div>
            {showEventDetails && (
              <>
                <div>
                  <label className="mb-1 block text-sm text-iaas-earth">
                    ¿Qué parte del encuentro te gustó más? *
                  </label>
                  <textarea
                    required
                    minLength={5}
                    rows={3}
                    className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20"
                    value={form.evento_parte_favorita}
                    onChange={(e) => updateField("evento_parte_favorita", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-iaas-earth">
                    ¿Qué parte del encuentro podemos mejorar?
                  </label>
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm focus:border-iaas-green focus:outline-none focus:ring-2 focus:ring-iaas-green/20"
                    value={form.evento_mejora}
                    onChange={(e) => updateField("evento_mejora", e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card>
          <CardTitle>Membresía IAAS — $10 anuales</CardTitle>
          <CardDescription>
            Accede a talleres, semanas de intercambio, capacitaciones, visitas a empresas y programas
            de intercambio. Tu aporte cubre derechos legales y gastos logísticos de la organización.
          </CardDescription>
          <PaymentInfo />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-iaas-earth">
              Comprobante de pago de la membresía *
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
        </Card>

        <Card>
          <CardTitle>Síguenos en Instagram</CardTitle>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {["@iaasecuador", "@iaas.world", "@exproiaas", "@iaas.america"].map((handle) => (
              <a
                key={handle}
                href={`https://instagram.com/${handle.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg bg-iaas-light px-3 py-2 text-iaas-green hover:underline"
              >
                <AtSign className="h-4 w-4" />
                {handle}
              </a>
            ))}
          </div>
        </Card>

        {catalogError && (
          <p className="text-sm text-amber-700">
            {catalogError}{" "}
            <button
              type="button"
              className="font-medium underline"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={loading || Boolean(success)}>
          {loading ? "Enviando registro..." : "Enviar solicitud de membresía"}
        </Button>
      </form>

      <p className="text-center text-sm text-iaas-earth">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-iaas-green hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
