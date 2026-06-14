"use client";

import { useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { AdminActionResponse, PendingMember } from "@/types";

export default function AdminPendingPage() {
  const [members, setMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function loadPending() {
    setLoading(true);
    try {
      const { data } = await api.get<PendingMember[]>("/admin/pending");
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPending();
  }, []);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionLoading(id);
    setMembers((current) => current.filter((member) => member.id !== id));

    try {
      await api.patch<AdminActionResponse>(`/admin/members/${id}/${action}`);
    } catch {
      await loadPending();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-iaas-green">Aprobaciones pendientes</h1>
        <p className="text-iaas-earth">Panel administrativo del directorio IAAS.</p>
      </div>

      <Card>
        <CardTitle>Solicitudes de renovación</CardTitle>
        <CardDescription>Revisa comprobantes y aprueba o rechaza cada solicitud.</CardDescription>

        {loading ? (
          <p className="mt-6 text-sm text-iaas-earth">Cargando solicitudes...</p>
        ) : members.length === 0 ? (
          <p className="mt-6 rounded-xl bg-iaas-light px-4 py-6 text-sm text-iaas-green">
            No hay membresías pendientes por revisar.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-iaas-earth/10 text-iaas-earth">
                <tr>
                  <th className="px-3 py-2">Miembro</th>
                  <th className="px-3 py-2">Correo</th>
                  <th className="px-3 py-2">Institución</th>
                  <th className="px-3 py-2">Inscripción</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-iaas-earth/5">
                    <td className="px-3 py-3 font-medium">{member.nombres}</td>
                    <td className="px-3 py-3">{member.correo}</td>
                    <td className="px-3 py-3">{member.institucion}</td>
                    <td className="px-3 py-3">{formatDate(member.fecha_inscripcion)}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPreviewUrl(member.url_comprobante)}
                          disabled={!member.url_comprobante}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAction(member.id, "approve")}
                          disabled={actionLoading === member.id}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleAction(member.id, "reject")}
                          disabled={actionLoading === member.id}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Rechazar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-iaas-green">Comprobante de pago</h2>
              <Button variant="ghost" onClick={() => setPreviewUrl(null)}>
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
