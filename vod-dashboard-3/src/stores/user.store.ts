import { defineStore } from "pinia";
import type { AuthState, User } from "@/types/auth";

export const useUserStore = defineStore("user", {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (s) => Boolean(s.token),
    groups: (s) => s.user?.groups ?? [],
    isAdmin: (s) =>
      (s.user?.groups ?? []).includes("GR_vodoo_admin") ||
      (s.user?.groups ?? []).includes("vodoo_api"),
  },

  actions: {
    setUser(user: User | null) {
      this.user = user;
    },
    setToken(token: string | null) {
      this.token = token;
    },
    logout() {
      this.user = null;
      this.token = null;
    },
  },
});
