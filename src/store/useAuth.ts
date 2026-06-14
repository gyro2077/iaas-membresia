"use client";

import { create } from "zustand";

import { clearStoredToken, getStoredToken, setStoredToken } from "@/lib/api";
import type { UserProfile } from "@/types";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  hydrated: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setAuth: (token, user) => {
    setStoredToken(token);
    set({ token, user, hydrated: true });
  },
  setUser: (user) => set({ user }),
  clearAuth: () => {
    clearStoredToken();
    set({ token: null, user: null, hydrated: true });
  },
  hydrate: () => {
    const token = getStoredToken();
    set({ token, hydrated: true });
  },
}));

export const selectIsAdmin = (state: AuthState) => state.user?.rol === "ADMIN";
export const selectMustChangePassword = (state: AuthState) =>
  Boolean(state.user?.debe_cambiar_password);
