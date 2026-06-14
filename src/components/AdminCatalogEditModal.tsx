"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { CatalogSelect } from "@/components/CatalogSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { AdminMember, AdminMemberCatalogUpdate } from "@/types";

interface AdminCatalogEditModalProps {
  member: AdminMember | null;
  onClose: () => void;
  onSaved: (member: AdminMember) => void;
}

export function AdminCatalogEditModal({ member, onClose, onSaved }: AdminCatalogEditModalProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cantons, setCantons] = useState<{ id: string; name: string }[]>([]);
  const [institutionId, setInstitutionId] = useState("");
  const [careerId, setCareerId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [cantonId, setCantonId] = useState("");
  const [customCareer, setCustomCareer] = useState("");
  const [useCustomCareer, setUseCustomCareer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!member) return;
    void Promise.all([fetchInstitutions(), fetchProvinces()]).then(([inst, prov]) => {
      setInstitutions(inst);
      setProvinces(prov);
    });
    setInstitutionId(member.institution_id ? String(member.institution_id) : "");
    setCareerId(member.career_id ? String(member.career_id) : "");
    setProvinceId(member.province_id ?? "");
    setCantonId(member.canton_id ?? "");
    setCustomCareer(member.carrera);
    setUseCustomCareer(false);
    setError(null);
  }, [member]);

  useEffect(() => {
    if (!institutionId) {
      setCareers([]);
      return;
    }
    void fetchCareers(Number(institutionId)).then(setCareers);
  }, [institutionId]);

  useEffect(() => {
    if (!provinceId) {
      setCantons([]);
      return;
    }
    void fetchCantons(provinceId).then(setCantons);
  }, [provinceId]);

  if (!member) return null;

  async function handleSave() {
    if (!member) return;
    const memberId = member.id;
    if (!institutionId || !provinceId || !cantonId) {
      setError("Selecciona institución, provincia y cantón.");
      return;
    }
    if (!useCustomCareer && !careerId) {
      setError("Selecciona una carrera o usa carrera personalizada.");
      return;
    }
    if (useCustomCareer && customCareer.trim().length < 2) {
      setError("Indica un nombre de carrera válido.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: AdminMemberCatalogUpdate = {
        institution_id: Number(institutionId),
        province_id: provinceId,
        canton_id: cantonId,
      };
      if (useCustomCareer) {
        payload.career_name = customCareer.trim();
      } else {
        payload.career_id = Number(careerId);
      }

      const { data } = await api.patch<AdminMember>(
        `/admin/members/${memberId}/catalog`,
        payload,
      );
      onSaved(data);
      onClose();
    } catch {
      setError("No se pudo guardar el catálogo del miembro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-iaas-green">Corregir catálogo</h2>
        <p className="mt-1 text-sm text-iaas-earth">{member.nombres}</p>
        <p className="mt-2 rounded-lg bg-iaas-light px-3 py-2 text-xs text-iaas-earth">
          Datos actuales: {member.institucion} · {member.carrera} · {member.ciudad}
        </p>

        <div className="mt-4 space-y-4">
          <CatalogSelect
            label="Institución"
            required
            value={institutionId}
            onChange={(value) => {
              setInstitutionId(value);
              setCareerId("");
            }}
            options={institutions.map((item) => ({
              id: String(item.id),
              label: item.alias ? `${item.name} (${item.alias})` : item.name,
            }))}
          />
          {!useCustomCareer ? (
            <CatalogSelect
              label="Carrera"
              required
              disabled={!institutionId}
              value={careerId}
              onChange={setCareerId}
              options={careers.map((item) => ({
                id: String(item.id),
                label: item.name,
              }))}
            />
          ) : (
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Carrera personalizada *</label>
              <Input
                value={customCareer}
                onChange={(e) => setCustomCareer(e.target.value)}
                placeholder="Ej. Ingeniería Agropecuaria"
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-iaas-earth">
            <input
              type="checkbox"
              checked={useCustomCareer}
              onChange={(e) => setUseCustomCareer(e.target.checked)}
            />
            La carrera no está en la lista (crear nueva)
          </label>
          <CatalogSelect
            label="Provincia"
            required
            value={provinceId}
            onChange={(value) => {
              setProvinceId(value);
              setCantonId("");
            }}
            options={provinces.map((item) => ({ id: item.id, label: item.name }))}
          />
          <CatalogSelect
            label="Cantón / ciudad"
            required
            disabled={!provinceId}
            value={cantonId}
            onChange={setCantonId}
            options={cantons.map((item) => ({ id: item.id, label: item.name }))}
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar catálogo"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
