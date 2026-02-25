import { defineStore } from "pinia";
import type { AuthState, User } from "@/types/auth";

export const useUserStore = defineStore("user", {
    state: (): AuthState => ({
        user: null,
        token: null,
    }),

    getters: {
        isAuthenticated: (s) => !!s.token,
        groups: (s) => s.user?.groups ?? [],
        isAdmin: (s) =>
            (s.user?.groups ?? []).includes("GR_vodoo_admin") ||
            (s.user?.groups ?? []).includes("vodoo_api"),
    },

    actions: {
        // Simulation : tu remplaceras par un vrai call API plus tard
        loginFake(payload: { username: string; groups: string[] }) {
            this.user = { username: payload.username, groups: payload.groups } satisfies User;
            this.token = "FAKE_TOKEN";
        },

        logout() {
            this.user = null;
            this.token = null;
        },

        setToken(token: string | null) {
            this.token = token;
        },
    },
});