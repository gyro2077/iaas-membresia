"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, setStoredToken } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import type { TokenResponse, UserProfile } from "@/types";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcePassword = searchParams.get("forcePassword") === "1";
  const { user, setAuth, setUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    nombres: "",
    institucion: "",
    carrera: "",
    ciudad: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.nombres) {
      setProfileForm({
        nombres: user.nombres,
        institucion: user.institucion,
        carrera: user.carrera,
        ciudad: user.ciudad,
      });
    }
  }, [user]);

  async function handleProfileSubmit(event: FormEvent) {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

    try {
      const { data } = await api.patch<UserProfile>("/users/me", profileForm);
      setUser(data);
      setProfileMessage("Perfil actualizado correctamente.");
    } catch {
      setProfileError("No se pudo actualizar el perfil.");
    }
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    const mustChange = forcePassword || user?.debe_cambiar_password === true;

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("La confirmación no coincide con la nueva contraseña.");
      return;
    }

    if (mustChange && passwordForm.new_password === "IAAS2026!") {
      setPasswordError("Elige una contraseña distinta a la temporal IAAS2026!.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = mustChange
        ? { new_password: passwordForm.new_password }
        : {
            current_password: passwordForm.current_password,
            new_password: passwordForm.new_password,
          };

      const { data } = await api.post<TokenResponse>("/auth/change-password", payload);
      setStoredToken(data.access_token);
      const { data: refreshedUser } = await api.get<UserProfile>("/users/me");
      setAuth(data.access_token, refreshedUser);
      setPasswordMessage("Contraseña actualizada. Ya puedes usar el dashboard completo.");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      if (forcePassword || mustChange) {
        const destination = refreshedUser.rol === "ADMIN" ? "/admin/pending" : "/dashboard";
        setTimeout(() => router.push(destination), 1200);
      }
    } catch (err) {
      const detail =
        axios.isAxiosError(err) && typeof err.response?.data?.detail === "string"
          ? err.response.data.detail
          : "No se pudo cambiar la contraseña. Intenta de nuevo.";
      setPasswordError(detail);
    } finally {
      setSubmitting(false);
    }
  }

  const mustChange = forcePassword || user?.debe_cambiar_password === true;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-iaas-green">Configuración</h1>
        <p className="text-iaas-earth">Administra tu perfil y credenciales de acceso.</p>
        {user?.correo && (
          <p className="mt-1 text-sm text-iaas-earth/80">Sesión: {user.correo}</p>
        )}
      </div>

      {mustChange && (
        <div className="rounded-xl border border-iaas-accent/40 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          <p className="font-medium">Primer acceso detectado</p>
          <p className="mt-1">
            Ya iniciaste sesión correctamente. Solo necesitas elegir una contraseña nueva para
            continuar — no hace falta volver a ingresar la temporal.
          </p>
        </div>
      )}

      <Card>
        <CardTitle>{mustChange ? "Define tu contraseña personal" : "Cambiar contraseña"}</CardTitle>
        <CardDescription>
          {mustChange
            ? "Elige una contraseña segura de al menos 8 caracteres (distinta a IAAS2026!)."
            : "Ingresa tu contraseña actual y la nueva contraseña."}
        </CardDescription>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          {!mustChange && (
            <Input
              type="password"
              required
              autoComplete="current-password"
              placeholder="Contraseña actual"
              value={passwordForm.current_password}
              onChange={(e) =>
                setPasswordForm((current) => ({ ...current, current_password: e.target.value }))
              }
            />
          )}
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Nueva contraseña"
            value={passwordForm.new_password}
            onChange={(e) =>
              setPasswordForm((current) => ({ ...current, new_password: e.target.value }))
            }
          />
          <Input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Confirmar nueva contraseña"
            value={passwordForm.confirm_password}
            onChange={(e) =>
              setPasswordForm((current) => ({ ...current, confirm_password: e.target.value }))
            }
          />
          {passwordMessage && <p className="text-sm text-iaas-green">{passwordMessage}</p>}
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : mustChange ? "Guardar y continuar" : "Actualizar contraseña"}
          </Button>
        </form>
      </Card>

      {!mustChange && user && (
        <Card>
          <CardTitle>Editar perfil</CardTitle>
          <CardDescription>Actualiza tu información académica y de contacto.</CardDescription>
          <form onSubmit={handleProfileSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-iaas-earth">Nombres</label>
              <Input
                value={profileForm.nombres}
                onChange={(e) => setProfileForm((c) => ({ ...c, nombres: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Institución</label>
              <Input
                value={profileForm.institucion}
                onChange={(e) => setProfileForm((c) => ({ ...c, institucion: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Carrera</label>
              <Input
                value={profileForm.carrera}
                onChange={(e) => setProfileForm((c) => ({ ...c, carrera: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Ciudad</label>
              <Input
                value={profileForm.ciudad}
                onChange={(e) => setProfileForm((c) => ({ ...c, ciudad: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              {profileMessage && <p className="mb-3 text-sm text-iaas-green">{profileMessage}</p>}
              {profileError && <p className="mb-3 text-sm text-red-600">{profileError}</p>}
              <Button type="submit">Guardar cambios</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="px-4 py-10 text-iaas-earth">Cargando configuración...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
