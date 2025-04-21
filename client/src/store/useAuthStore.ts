"use client";

import { getAxiosInstance } from "@/lib/axios";
import { API_ROUTES } from "@/utils/api";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: string;
  name: string | null;
  avaterUrl: string | null;
  email: string;
  role: "USER" | "SUPER_ADMIN";
  gameCoin: number;
  gameSeason: Record<string, any>[];
  gameAchievements: Record<string, any>[];
};

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  tokens: {
    accessToken: string;
    refreshToken: string;
  } | null;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<string | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getUser: () => Promise<User | null>;
  refreshAccessToken: () => Promise<Boolean>;
  getTokens: () => Promise<{
    accessToken: string;
    refreshToken: string;
  } | null>;
  setTokens: (tokens: { access: string; refresh: string }) => Promise<void>;
  authorizeOAuthUser: (ouid: string) => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const ax = getAxiosInstance(API_ROUTES.AUTH);
          const response = await ax.post("/register", {
            name,
            email,
            password,
          });

          set({ isLoading: false });
          return response.data.userId;
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Registration failed"
              : "Registration failed",
          });

          return null;
        }
      },
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const ax = getAxiosInstance(API_ROUTES.AUTH);
          const response = await ax.post("/login", {
            email,
            password,
          });

          set({
            isLoading: false,
            user: {
              ...response.data.user,
              profile: response.data.user.avaterUrl,
            },
            tokens: {
              accessToken: response.data.tokens.accessToken,
              refreshToken: response.data.tokens.refreshToken,
            },
          });

          // Set the cookies in the browser
          await fetch("/api/cookie", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: response.data.tokens.accessToken,
              refreshToken: response.data.tokens.refreshToken,
            }),
          });
          return true;
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Login failed"
              : "Login failed",
          });

          return false;
        }
      },
      getUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const ax = getAxiosInstance(API_ROUTES.AUTH);
          const response = await ax.post("/me");
          set({
            user: response.data.user,
            isLoading: false,
          });
          return response.data.user;
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Failed to fetch user"
              : "Failed to fetch user",
          });
          return null;
        }
      },
      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const ax = getAxiosInstance(API_ROUTES.AUTH);
          await ax.post("/logout");
          set({ user: null, isLoading: false, tokens: null });
          await fetch("/api/cookie/logout", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage");
            window.location.href = "/";
          }
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Logout failed"
              : "Logout failed",
          });
        }
      },
      refreshAccessToken: async () => {
        try {
          const ax = getAxiosInstance(API_ROUTES.AUTH);
          await ax.post("/refresh-token");
          return true;
        } catch (e) {
          console.error(e);
          return false;
        }
      },
      getTokens: async () => {
        try {
          const response = get().tokens;
          return response;
        } catch (e) {
          console.error(e);
          return null;
        }
      },
      setTokens: async (tokens) => {
        set({ isLoading: true, error: null });
        set({
          tokens: { accessToken: tokens.access, refreshToken: tokens.refresh },
        });
        set({ isLoading: false });
      },
      authorizeOAuthUser: async (ouid) => {
        set({ isLoading: true, error: null });
        try {
          const ax = getAxiosInstance(API_ROUTES.AUTH);
          const response = await ax.post(
            "/oauth/authorize",
            {},
            {
              params: {
                ouid,
              },
            }
          );

          console.log("### GOT => ", response.data);

          set({
            user: {
              id: response.data.user.id,
              name: response.data.user.name,
              avaterUrl: response.data.user.avaterUrl,
              email: response.data.user.email,
              role: response.data.user.role,
              gameCoin: response.data.user.gameCoin || 0,
              gameSeason: response.data.user.gameSeason || [],
              gameAchievements: response.data.user.gameAchievements || [],
            },
            isLoading: false,
            tokens: response.data.tokens,
          });

          // Set the cookies in the browser
          await fetch("/api/cookie", {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              accessToken: response.data.tokens.accessToken,
              refreshToken: response.data.tokens.refreshToken,
            }),
          });
        } catch (error) {
          set({
            isLoading: false,
            error: axios.isAxiosError(error)
              ? error?.response?.data?.error || "Failed to fetch user"
              : "Failed to fetch user",
          });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ user: state.user }),
    }
  )
);
