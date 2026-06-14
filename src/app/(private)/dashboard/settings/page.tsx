"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
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
  });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

    try {
      const { data } = await api.post<TokenResponse>("/auth/change-password", passwordForm);
      const { data: refreshedUser } = await api.get<UserProfile>("/users/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      setAuth(data.access_token, refreshedUser);
      setPasswordMessage("Contraseña actualizada. Ya puedes usar el dashboard completo.");
      setPasswordForm({ current_password: "", new_password: "" });
      if (forcePassword) {
        setTimeout(() => router.push("/dashboard"), 1200);
      }
    } catch {
      setPasswordError("No se pudo cambiar la contraseña. Verifica la contraseña actual.");
    }
  }

  const mustChange = forcePassword || user?.debe_cambiar_password;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold text-iaas-green">Configuración</h1>
        <p className="text-iaas-earth">Administra tu perfil y credenciales de acceso.</p>
      </div>

      {mustChange && (
        <div className="rounded-xl border border-iaas-accent/40 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
          Debes cambiar tu contraseña temporal antes de continuar usando la plataforma.
        </div>
      )}

      <Card>
        <CardTitle>Cambiar contraseña</CardTitle>
        <CardDescription>Requerido en tu primer acceso con contraseña temporal.</CardDescription>
        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
          <Input
            type="password"
            required
            placeholder="Contraseña actual"
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm((c) => ({ ...c, current_password: e.target.value }))}
          />
          <Input
            type="password"
            required
            minLength={8}
            placeholder="Nueva contraseña"
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm((c) => ({ ...c, new_password: e.target.value }))}
          />
          {passwordMessage && <p className="text-sm text-iaas-green">{passwordMessage}</p>}
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          <Button type="submit">Actualizar contraseña</Button>
        </form>
      </Card>

      {!mustChange && user && (
        <Card>
          <CardTitle>Editar perfil</CardTitle>
          <CardDescription>Actualiza tu información académica y de contacto.</CardDescription>
          <form onSubmit={handleProfileSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm text-iaas-earth">Nombres</label>
              <Input value={profileForm.nombres} onChange={(e) => setProfileForm((c) => ({ ...c, nombres: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Institución</label>
              <Input value={profileForm.institucion} onChange={(e) => setProfileForm((c) => ({ ...c, institucion: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Carrera</label>
              <Input value={profileForm.carrera} onChange={(e) => setProfileForm((c) => ({ ...c, carrera: e.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-iaas-earth">Ciudad</label>
              <Input value={profileForm.ciudad} onChange={(e) => setProfileForm((c) => ({ ...c, ciudad: e.target.value }))} />
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
