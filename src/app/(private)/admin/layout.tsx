"use client";

import { useEffect } from "react";

import { AdminGuard } from "@/components/AdminGuard";
import { api } from "@/lib/api";
import { useAuth } from "@/store/useAuth";
import type { UserProfile } from "@/types";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, token } = useAuth();

  useEffect(() => {
    if (!token) return;
    void api.get<UserProfile>("/users/me").then(({ data }) => setUser(data));
  }, [token, setUser]);

  return <AdminGuard>{children}</AdminGuard>;
}
