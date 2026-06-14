"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AdminActionResponse, AdminMember, AdminMemberListResponse } from "@/types";

const ESTADOS = ["", "ACTIVO", "PENDIENTE", "EXPIRADO", "RECHAZADO"] as const;

function statusBadgeClass(estado: string) {
  switch (estado) {
    case "ACTIVO":
      return "bg-green-100 text-green-800";
    case "PENDIENTE":
      return "bg-amber-100 text-amber-900";
    case "EXPIRADO":
      return "bg-red-100 text-red-800";
    case "RECHAZADO":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-iaas-light text-iaas-earth";
  }
}

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }
  return "No se pudo completar la acción.";
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );

  const [estado, setEstado] = useState("");
  const [q, setQ] = useState("");
  const [expiringOnly, setExpiringOnly] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const params: Record<string, string | number | boolean> = { page, limit };
      if (estado) params.estado = estado;
      if (q) params.q = q;
      if (expiringOnly) params.expiring_days = 30;

      const { data } = await api.get<AdminMemberListResponse>("/admin/members", { params });
      setMembers(data.items);
      setTotal(data.total);
    } catch (error) {
      setLoadFailed(true);
      setFeedback({ type: "error", message: getApiErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [page, limit, estado, q, expiringOnly]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function handleExport() {
    setExporting(true);
    try {
      const params: Record<string, string | number | boolean> = {};
      if (estado) params.estado = estado;
      if (q) params.q = q;
      if (expiringOnly) params.expiring_days = 30;

      const response = await api.get("/admin/members/export", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `iaas_miembros_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      setFeedback({ type: "success", message: "Excel descargado correctamente." });
    } catch {
      setFeedback({ type: "error", message: "No se pudo exportar el Excel." });
    } finally {
      setExporting(false);
    }
  }

  async function handleAction(memberId: string, action: "approve" | "reject") {
    setActionLoading(`${memberId}-${action}`);
    try {
      const { data } = await api.patch<AdminActionResponse>(
        `/admin/members/${memberId}/${action}`,
      );
      setFeedback({ type: "success", message: data.message });
      await loadMembers();
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error) });
    } finally {
      setActionLoading(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-iaas-green">Directorio de miembros</h1>
          <p className="mt-1 text-iaas-earth">
            Audita membresías, estados de pago y exporta reportes a Excel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void loadMembers()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button type="button" onClick={() => void handleExport()} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar Excel
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border border-green-200 bg-green-50 text-green-900"
              : "border border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <Card className="mb-6">
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Refina la lista antes de auditar o exportar.</CardDescription>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-iaas-earth">Estado</label>
            <select
              className="w-full rounded-lg border border-iaas-earth/20 px-3 py-2 text-sm"
              value={estado}
              onChange={(e) => {
                setPage(1);
                setEstado(e.target.value);
              }}
            >
              <option value="">Todos</option>
              {ESTADOS.filter(Boolean).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm text-iaas-earth">Buscar</label>
            <div className="flex gap-2">
              <Input
                placeholder="Nombre, correo o institución"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(1);
                    setQ(searchInput.trim());
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPage(1);
                  setQ(searchInput.trim());
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-iaas-earth">
              <input
                type="checkbox"
                checked={expiringOnly}
                onChange={(e) => {
                  setPage(1);
                  setExpiringOnly(e.target.checked);
                }}
              />
              Por vencer (30 días)
            </label>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Miembros ({total})</CardTitle>
          <span className="text-sm text-iaas-earth">
            Página {page} de {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-iaas-earth">
            <Loader2 className="h-5 w-5 animate-spin text-iaas-green" />
            Cargando miembros...
          </div>
        ) : loadFailed ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-900">
            <AlertCircle className="mx-auto mb-2 h-8 w-8" />
            No se pudo cargar el directorio.
            <Button type="button" variant="secondary" className="mt-4" onClick={() => void loadMembers()}>
              Reintentar
            </Button>
          </div>
        ) : members.length === 0 ? (
          <p className="py-12 text-center text-sm text-iaas-earth">
            No hay miembros con los filtros seleccionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-iaas-earth/10 text-iaas-earth">
                <tr>
                  <th className="px-3 py-2">Miembro</th>
                  <th className="px-3 py-2">Institución</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Expira</th>
                  <th className="px-3 py-2">Días</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-iaas-earth/5 align-top">
                    <td className="px-3 py-3">
                      <p className="font-medium text-iaas-green">{member.nombres}</p>
                      <p className="text-xs text-iaas-earth">{member.correo}</p>
                      {member.telefono && (
                        <p className="text-xs text-iaas-earth/70">{member.telefono}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p>{member.institucion}</p>
                      <p className="text-xs text-iaas-earth">{member.carrera}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(member.estado_pago)}`}
                      >
                        {member.estado_pago}
                      </span>
                    </td>
                    <td className="px-3 py-3">{formatDate(member.fecha_expiracion)}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          member.days_remaining <= 30 && member.estado_pago === "ACTIVO"
                            ? "font-semibold text-amber-700"
                            : ""
                        }
                      >
                        {member.days_remaining}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {member.url_comprobante && (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setPreviewUrl(member.url_comprobante)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {member.estado_pago === "PENDIENTE" && (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              disabled={Boolean(actionLoading)}
                              onClick={() => void handleAction(member.id, "approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={Boolean(actionLoading)}
                              onClick={() => void handleAction(member.id, "reject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        )}
      </Card>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="max-h-[90vh] max-w-3xl overflow-auto rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex justify-end">
              <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewUrl(null)}>
                Cerrar
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Comprobante" className="mx-auto max-h-[70vh] rounded-lg object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
