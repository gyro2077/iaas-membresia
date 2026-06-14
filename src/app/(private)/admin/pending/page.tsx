"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  RefreshCw,
  X,
} from "lucide-react";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AdminActionResponse, PendingMember } from "@/types";

type PendingAction = "approve" | "reject";

type ConfirmState = {
  member: PendingMember;
  action: PendingAction;
};

function getApiErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg ?? String(item)).join(". ");
    }
    if (error.response?.status === 403) {
      return "No tienes permisos de administrador. Cierra sesión e ingresa de nuevo.";
    }
    if (error.response?.status === 404) {
      return "La solicitud ya no existe o fue procesada.";
    }
  }
  return "No se pudo completar la acción. Intenta de nuevo.";
}

export default function AdminPendingPage() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewMember, setPreviewMember] = useState<PendingMember | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null,
  );
  const [loadFailed, setLoadFailed] = useState(false);

  const loadPending = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const { data } = await api.get<PendingMember[]>("/admin/pending");
      setMembers(data);
      setLoadFailed(false);
    } catch (error) {
      setLoadFailed(true);
      setFeedback({ type: "error", message: getApiErrorMessage(error) });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPending();
  }, [loadPending]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!previewMember && !confirm) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !actionLoading) {
        setPreviewMember(null);
        setConfirm(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [previewMember, confirm, actionLoading]);

  async function executeAction(member: PendingMember, action: PendingAction) {
    const actionKey = `${member.id}-${action}`;
    setActionLoading(actionKey);
    setConfirm(null);

    try {
      const { data } = await api.patch<AdminActionResponse>(
        `/admin/members/${member.id}/${action}`,
      );
      setMembers((current) => current.filter((item) => item.id !== member.id));
      setPreviewMember((current) => (current?.id === member.id ? null : current));
      setFeedback({
        type: "success",
        message: data.message ?? (action === "approve" ? "Membresía aprobada." : "Solicitud rechazada."),
      });
    } catch (error) {
      setFeedback({ type: "error", message: getApiErrorMessage(error) });
      await loadPending(true);
    } finally {
      setActionLoading(null);
    }
  }

  function isActionBusy(memberId: string, action?: PendingAction) {
    if (!actionLoading) return false;
    if (action) return actionLoading === `${memberId}-${action}`;
    return actionLoading.startsWith(`${memberId}-`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-iaas-green">Aprobaciones pendientes</h1>
          <p className="mt-1 text-iaas-earth">
            Revisa comprobantes y decide cada solicitud de renovación.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => void loadPending(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Actualizar lista
        </Button>
      </div>

      {feedback && (
        <div
          role="alert"
          className={`mb-6 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border border-green-200 bg-green-50 text-green-900"
              : "border border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <p>{feedback.message}</p>
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Solicitudes de renovación</CardTitle>
            <CardDescription>
              {loading
                ? "Cargando solicitudes..."
                : members.length === 0
                  ? "No hay solicitudes en cola."
                  : `${members.length} solicitud${members.length === 1 ? "" : "es"} por revisar`}
            </CardDescription>
          </div>
          {!loading && members.length > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
              {members.length} pendiente{members.length === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-2 py-12 text-sm text-iaas-earth">
            <Loader2 className="h-5 w-5 animate-spin text-iaas-green" />
            Cargando solicitudes...
          </div>
        ) : loadFailed ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-600" />
            <p className="font-medium text-red-900">No se pudo cargar la lista</p>
            <p className="mt-1 text-sm text-red-800">
              Revisa tu conexión o permisos de administrador e intenta de nuevo.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => void loadPending()}
            >
              Reintentar
            </Button>
          </div>
        ) : members.length === 0 ? (
          <div className="mt-6 rounded-xl bg-iaas-light px-4 py-8 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-iaas-green" />
            <p className="font-medium text-iaas-green">¡Todo al día!</p>
            <p className="mt-1 text-sm text-iaas-earth">
              No hay membresías pendientes por revisar en este momento.
            </p>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {members.map((member) => (
              <li
                key={member.id}
                className="rounded-xl border border-iaas-earth/10 bg-iaas-light/40 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div>
                      <h3 className="text-lg font-semibold text-iaas-green">{member.nombres}</h3>
                      <p className="text-sm text-iaas-earth">{member.correo}</p>
                    </div>
                    <dl className="grid gap-1 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-iaas-earth/70">Institución</dt>
                        <dd className="font-medium text-iaas-earth">{member.institucion}</dd>
                      </div>
                      <div>
                        <dt className="text-iaas-earth/70">Carrera</dt>
                        <dd className="font-medium text-iaas-earth">{member.carrera}</dd>
                      </div>
                      <div>
                        <dt className="text-iaas-earth/70">Ciudad</dt>
                        <dd className="font-medium text-iaas-earth">{member.ciudad}</dd>
                      </div>
                      <div>
                        <dt className="text-iaas-earth/70">Fecha de inscripción</dt>
                        <dd className="font-medium text-iaas-earth">
                          {formatDate(member.fecha_inscripcion)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="w-full sm:w-auto"
                      onClick={() => setPreviewMember(member)}
                      disabled={!member.url_comprobante || isActionBusy(member.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver comprobante
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => setConfirm({ member, action: "approve" })}
                      disabled={isActionBusy(member.id)}
                    >
                      {isActionBusy(member.id, "approve") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="mr-2 h-4 w-4" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      className="w-full sm:w-auto"
                      onClick={() => setConfirm({ member, action: "reject" })}
                      disabled={isActionBusy(member.id)}
                    >
                      {isActionBusy(member.id, "reject") ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Rechazar
                    </Button>
                  </div>
                </div>

                {!member.url_comprobante && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    Este miembro no tiene comprobante adjunto. Puedes rechazar la solicitud o
                    contactarlo para que suba uno nuevo.
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      {previewMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
          onClick={() => setPreviewMember(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4 shadow-xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="receipt-title" className="text-lg font-semibold text-iaas-green">
                  Comprobante de pago
                </h2>
                <p className="text-sm text-iaas-earth">
                  {previewMember.nombres} · {previewMember.correo}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {previewMember.url_comprobante && (
                  <a
                    href={previewMember.url_comprobante}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-lg border border-iaas-earth/30 bg-white px-3 py-1.5 text-sm font-medium text-iaas-earth transition hover:bg-iaas-light"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir en pestaña
                  </a>
                )}
                <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewMember(null)}>
                  Cerrar
                </Button>
              </div>
            </div>

            {previewMember.url_comprobante ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewMember.url_comprobante}
                alt={`Comprobante de ${previewMember.nombres}`}
                className="mx-auto max-h-[65vh] w-full rounded-lg object-contain"
              />
            ) : (
              <p className="rounded-lg bg-iaas-light px-4 py-8 text-center text-sm text-iaas-earth">
                No hay comprobante disponible para este miembro.
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 border-t border-iaas-earth/10 pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => {
                  setPreviewMember(null);
                  setConfirm({ member: previewMember, action: "reject" });
                }}
                disabled={isActionBusy(previewMember.id)}
              >
                Rechazar solicitud
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setPreviewMember(null);
                  setConfirm({ member: previewMember, action: "approve" });
                }}
                disabled={isActionBusy(previewMember.id)}
              >
                Aprobar membresía
              </Button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          onClick={() => !actionLoading && setConfirm(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="confirm-title" className="text-lg font-semibold text-iaas-green">
              {confirm.action === "approve" ? "¿Aprobar membresía?" : "¿Rechazar solicitud?"}
            </h2>
            <p className="mt-2 text-sm text-iaas-earth">
              {confirm.action === "approve" ? (
                <>
                  Se activará la membresía de <strong>{confirm.member.nombres}</strong> (
                  {confirm.member.correo}) por un año más.
                </>
              ) : (
                <>
                  Se rechazará la renovación de <strong>{confirm.member.nombres}</strong>. Deberá
                  subir un nuevo comprobante para volver a solicitarla.
                </>
              )}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirm(null)}
                disabled={Boolean(actionLoading)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant={confirm.action === "approve" ? "primary" : "danger"}
                onClick={() => void executeAction(confirm.member, confirm.action)}
                disabled={Boolean(actionLoading)}
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : confirm.action === "approve" ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                {confirm.action === "approve" ? "Sí, aprobar" : "Sí, rechazar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
